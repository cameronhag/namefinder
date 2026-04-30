import express from 'express';
import { XMLParser } from 'fast-xml-parser';

const app = express();
app.use(express.json({ limit: '64kb' }));

const {
  NAMECHEAP_API_USER,
  NAMECHEAP_API_KEY,
  NAMECHEAP_USERNAME,
  PROXY_SECRET,
  USE_SANDBOX,
  PORT = 8080,
} = process.env;

const requiredEnv = ['NAMECHEAP_API_USER', 'NAMECHEAP_API_KEY', 'NAMECHEAP_USERNAME', 'PROXY_SECRET'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const NAMECHEAP_BASE =
  USE_SANDBOX === 'true'
    ? 'https://api.sandbox.namecheap.com/xml.response'
    : 'https://api.namecheap.com/xml.response';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

function authenticate(req, res, next) {
  const provided = req.headers['x-proxy-secret'];
  if (!provided || provided !== PROXY_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/domains/check', authenticate, async (req, res) => {
  try {
    const { domains } = req.body || {};
    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'domains must be a non-empty array' });
    }
    if (domains.length > 50) {
      return res.status(400).json({ error: 'max 50 domains per request' });
    }

    const url = new URL(NAMECHEAP_BASE);
    url.searchParams.set('ApiUser', NAMECHEAP_API_USER);
    url.searchParams.set('ApiKey', NAMECHEAP_API_KEY);
    url.searchParams.set('UserName', NAMECHEAP_USERNAME);
    url.searchParams.set('ClientIp', '127.0.0.1');
    url.searchParams.set('Command', 'namecheap.domains.check');
    url.searchParams.set('DomainList', domains.join(','));

    const ncRes = await fetch(url, { method: 'GET' });
    const xml = await ncRes.text();
    const parsed = xmlParser.parse(xml);

    const status = parsed?.ApiResponse?.Status;
    if (status !== 'OK') {
      const errors = parsed?.ApiResponse?.Errors;
      console.error('Namecheap error', JSON.stringify(errors));
      return res.status(502).json({ error: 'namecheap_error', details: errors });
    }

    const results = parsed?.ApiResponse?.CommandResponse?.DomainCheckResult;
    const list = Array.isArray(results) ? results : results ? [results] : [];

    res.json({
      domains: list.map((r) => ({
        domain: r.Domain,
        available: r.Available === 'true',
        premium: r.IsPremiumName === 'true',
        premiumPrice: r.PremiumRegistrationPrice ? Number(r.PremiumRegistrationPrice) : null,
        eapFee: r.EapFee ? Number(r.EapFee) : null,
      })),
    });
  } catch (err) {
    console.error('check failed', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

app.listen(PORT, () => {
  console.log(`namecheap-proxy listening on ${PORT} (sandbox=${USE_SANDBOX === 'true'})`);
});
