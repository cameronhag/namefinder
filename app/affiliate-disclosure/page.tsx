import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How NameClaim uses affiliate links, who our partners are, and why this never influences which results you see.",
  alternates: { canonical: "https://nameclaim.xyz/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
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
        <h1 className="text-3xl font-semibold mb-2">Affiliate Disclosure</h1>
        <p className="text-gray-500 font-medium mb-8">Last updated: May 1, 2026</p>

        <Section title="The short version">
          <p>
            Some outbound links on NameClaim are affiliate links. If you click one and
            buy something, we may earn a small commission at no extra cost to you.
            Commissions help cover the cost of running the Service and keeping it free
            for founders. Affiliate relationships <strong>do not</strong> change which
            availability results we surface or which names we recommend.
          </p>
        </Section>

        <Section title="What this means in practice">
          <p>
            When you search a name on NameClaim, we check trademark, domain, and social
            handle availability. If a domain is available, we may show a link to
            register it through one of our partners. If you choose to register through
            that link, the partner pays us a referral commission. The price you pay is
            the same as it would be if you went directly to the partner&apos;s website.
          </p>
          <p className="mt-3">
            We will never alter availability results, mark a domain as taken when it
            isn&apos;t, or steer you toward a name solely because it pays us more. The
            only thing affiliate status changes is which retail link we surface for
            domain registration.
          </p>
        </Section>

        <Section title="Our affiliate partners">
          <p>
            At present, NameClaim participates in affiliate programs with the following
            services:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Namecheap</strong> &mdash; domain registration and renewal
            </li>
          </ul>
          <p className="mt-3">
            This list may change over time as we add or remove partners. The
            &ldquo;Last updated&rdquo; date at the top of this page reflects the most
            recent change.
          </p>
        </Section>

        <Section title="How we choose partners">
          <p className="mb-2">
            We pick affiliate partners based on three things, in this order:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Coverage and reliability</strong> &mdash; the partner has to
              actually serve the registrations or services we&apos;re recommending,
              with consistent uptime
            </li>
            <li>
              <strong>Pricing for users</strong> &mdash; the partner has to be
              competitive on price, with no hidden upsells, so referring you doesn&apos;t
              cost you more than going elsewhere
            </li>
            <li>
              <strong>Commission terms</strong> &mdash; only after the first two are
              true do we look at whether the program economics make sense for us
            </li>
          </ul>
          <p className="mt-3">
            If a partner stops meeting the first two criteria, we drop them, regardless
            of how lucrative the affiliate terms are.
          </p>
        </Section>

        <Section title="No paid placement">
          <p>
            We do not accept payment to place names higher in search results, to
            suggest particular names, or to flag names as available when they
            aren&apos;t. Paid placement isn&apos;t something we offer, full stop.
          </p>
        </Section>

        <Section title="FTC compliance">
          <p>
            This disclosure is provided in accordance with the U.S. Federal Trade
            Commission&apos;s 16 CFR Part 255 (&ldquo;Guides Concerning the Use of
            Endorsements and Testimonials in Advertising&rdquo;). Affiliate links on
            NameClaim are not always individually marked, so consider this site-wide
            disclosure your notice that any outbound link to a domain registrar or
            related service may be an affiliate link.
          </p>
        </Section>

        <Section title="Questions">
          <p className="mb-2">
            Have a question about how affiliate links work on NameClaim, or want to
            propose a partnership? Reach us at:
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
