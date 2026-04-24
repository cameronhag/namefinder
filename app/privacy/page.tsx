import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-12 text-base leading-7">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-4 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 font-medium mb-8">Last updated: April 24, 2026</p>

        <Section title="Introduction">
          <p>
            This Privacy Policy explains how NameClaim (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) collects, uses, and shares information when you use our website
            at{" "}
            <a href="https://nameclaim.xyz" className="underline">
              nameclaim.xyz
            </a>{" "}
            (the &ldquo;Service&rdquo;). We are committed to being transparent about our
            practices and giving you control over your information.
          </p>
          <p className="mt-3">
            By using NameClaim, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </Section>

        <Section title="Information We Collect">
          <Sub title="Information You Provide">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Feedback submissions:</strong> If you submit feedback through our
                feedback form, we collect the content of your message and any email address
                you choose to provide.
              </li>
              <li>
                <strong>Search queries:</strong> When you search for a name, we record the
                name and selected category in order to process your request and for product
                analytics purposes.
              </li>
            </ul>
          </Sub>

          <Sub title="Information Collected Automatically">
            <p className="mb-2">
              When you visit NameClaim, we automatically collect certain information
              through cookies and similar technologies, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Usage data:</strong> pages visited, clicks, search terms, session
                duration, and interactions with features
              </li>
              <li>
                <strong>Device and browser data:</strong> browser type, operating system,
                screen resolution, device type
              </li>
              <li>
                <strong>Network data:</strong> IP address (used for approximate geographic
                location and security)
              </li>
              <li>
                <strong>Referral data:</strong> the website or source that directed you to
                NameClaim, including UTM campaign parameters
              </li>
            </ul>
          </Sub>

          <Sub title="Cookies and Tracking Technologies">
            <p className="mb-2">
              We use cookies and similar technologies (such as localStorage and tracking
            pixels) to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
            <li>Remember your preferences and session state</li>
            <li>Understand how users interact with the Service</li>
            <li>Measure and improve performance</li>
            <li>Attribute visits to marketing sources</li>
            </ul>
            <p className="mt-3">
            You can control cookies through your browser settings. Blocking cookies may
            affect the functionality of the Service.
          </p>
          </Sub>
        </Section>

    
        <Section title="How We Use Your Information">
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide and maintain the Service, including returning search results</li>
            <li>Improve the product based on aggregate usage patterns</li>
            <li>Diagnose technical issues and monitor reliability</li>
            <li>Respond to feedback and communications from you</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">
            We do not sell your personal information to third parties.
          </p>
        </Section>

        <Section title="How We Share Your Information">
          <p className="mb-4">
            We share information with the following categories of third parties:
          </p>

          <Sub title="Analytics and Infrastructure Providers">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>PostHog (Product Analytics):</strong> receives events, pageviews,
                and user interaction data to help us understand how the Service is used.
              </li>
              <li>
                <strong>Vercel (Hosting and Analytics):</strong> provides hosting
                infrastructure and basic traffic analytics.
              </li>
              <li>
                <strong>Resend (Email Delivery):</strong> processes feedback form
                submissions and delivers them to our inbox.
              </li>
            </ul>
            <p className="mt-3">
              These providers act as data processors on our behalf and are contractually
              required to protect your information.
            </p>
          </Sub>

          <Sub title="Affiliate and Commercial Partners">
            <p>
              When you click links to external services (such as domain registrars,
              trademark filing services, or social media platforms) from NameClaim, those
              links may include referral or affiliate parameters. This means that if you
              make a purchase or complete an action on the destination site, we may
              receive a commission at no additional cost to you. We disclose affiliate
              relationships clearly. Your activity on those external sites is governed by
              their own privacy policies, not ours.
            </p>
          </Sub>

          <Sub title="Legal Requirements">
            <p>
              We may disclose your information if required to do so by law, subpoena, or
              court order, or if we believe in good faith that disclosure is necessary to
              protect our rights, your safety, or the safety of others.
            </p>
          </Sub>

          <Sub title="Business Transfers">
            <p>
              If NameClaim is involved in a merger, acquisition, or sale of assets, your
              information may be transferred as part of that transaction. We will notify
              you before your information is transferred and becomes subject to a
              different privacy policy.
            </p>
          </Sub>
        </Section>

        <Section title="Your Rights">
          <Sub title="If You Are in the European Economic Area, United Kingdom, or Switzerland (GDPR)">
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Request restriction of processing</li>
              <li>Request portability of your data in a machine-readable format</li>
              <li>Object to processing based on our legitimate interests</li>
              <li>Withdraw consent at any time where we rely on consent</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at support@nameclaim.xyz. We
              will respond within 30 days.
            </p>
          </Sub>

          <Sub title="If You Are a California Resident (CCPA/CPRA)">
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Know what personal information we collect, use, and share</li>
              <li>Request deletion of your personal information</li>
              <li>
                Opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal
                information (note: we do not sell personal information)
              </li>
              <li>Non-discrimination for exercising your rights</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at support@nameclaim.xyz.
            </p>
          </Sub>

          <Sub title="Opting Out of Analytics">
            <p className="mb-2">You can opt out of analytics tracking by:</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>
              Enabling &ldquo;Do Not Track&rdquo; in your browser (we respect this signal)
            </li>
            <li>Using browser extensions that block analytics scripts</li>
            <li>Clearing cookies or using private browsing mode</li>
            </ul>
          </Sub>
        </Section>

        

        <Section title="Data Retention">
          <p className="mb-2">
            We retain your information for as long as necessary to provide the Service and
            comply with legal obligations. Specifically:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Analytics data:</strong> retained for up to 7 years by PostHog under
              their default settings
            </li>
            <li>
              <strong>Feedback submissions:</strong> retained indefinitely unless you
              request deletion
            </li>
            <li>
              <strong>Server logs:</strong> retained for up to 30 days
            </li>
          </ul>
          <p className="mt-3">
            You can request deletion of your data at any time by contacting us at
            support@nameclaim.xyz.
          </p>
        </Section>

        <Section title="Data Security">
          <p>
            We use industry-standard security measures to protect your information,
            including encryption in transit (HTTPS), secure infrastructure (Vercel), and
            access controls. No system is 100% secure, however, and we cannot guarantee
            absolute security.
          </p>
          <p className="mt-3">
            If we become aware of a data breach that affects your personal information, we
            will notify you as required by applicable law.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            NameClaim is not intended for children under 13, and we do not knowingly
            collect personal information from children under 13. If you believe we have
            inadvertently collected information from a child under 13, please contact us
            and we will delete it.
          </p>
        </Section>

        <Section title="International Users">
          <p>
            NameClaim is operated from the United States. If you access the Service from
            outside the United States, your information will be transferred to, stored,
            and processed in the United States, where our servers and service providers
            are located. By using NameClaim, you consent to this transfer.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. If we make material
            changes, we will notify you by updating the &ldquo;Last updated&rdquo; date at
            the top of this policy and, where appropriate, by posting a notice on the
            Service. Your continued use of NameClaim after the changes take effect
            constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section title="Contact Us">
            <p className="mb-2">
                If you have questions about this Privacy Policy or want to exercise your
                rights, contact us at:
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
                <p>Email: support@nameclaim.xyz</p>
                <p>
                Website:{" "}
                <a href="https://nameclaim.xyz" className="underline">
                    https://nameclaim.xyz
                </a>
                </p>
            </div>
            </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}
