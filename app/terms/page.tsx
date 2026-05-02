import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of NameClaim, including disclaimers, acceptable use, and limitations of liability.",
  alternates: { canonical: "https://nameclaim.xyz/terms" },
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
        <p className="text-gray-500 font-medium mb-8">Last updated: May 1, 2026</p>

        <Section title="1. Acceptance">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of NameClaim
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) and the website at{" "}
            <a href="https://nameclaim.xyz" className="underline">
              nameclaim.xyz
            </a>{" "}
            (the &ldquo;Service&rdquo;). By accessing or using the Service you agree to
            these Terms. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. What NameClaim Does">
          <p>
            NameClaim is a free utility that helps founders quickly check whether a
            proposed business name appears to conflict with federal trademarks, common
            domain registrations, and major social media handles. Results are returned
            from third-party data sources (including USPTO, domain registries, and
            public social media platforms) and are presented without warranty.
          </p>
          <p className="mt-3">
            No account or signup is required to use the Service.
          </p>
        </Section>

        <Section title="3. Not Legal Advice">
          <p>
            <strong>NameClaim is not a law firm and does not provide legal advice.</strong>{" "}
            The Service does not establish an attorney-client relationship, and a clean
            NameClaim report does not guarantee that a name is safe to use. Trademark
            law is fact-specific and can involve common-law marks, state registrations,
            phonetic similarity, related goods or services, and international rights
            that the Service does not check.
          </p>
          <p className="mt-3">
            Before adopting a business name for active commercial use, consult a
            qualified trademark attorney. Decisions you make based on Service results
            are your responsibility.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p className="mb-2">When using the Service, you agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Use the Service in violation of any applicable law, regulation, or
              third-party rights
            </li>
            <li>
              Scrape, crawl, automate, or otherwise collect data from the Service in
              bulk, or attempt to bypass rate limits
            </li>
            <li>
              Reverse-engineer, decompile, or attempt to extract source code, except
              where such activity is permitted by law
            </li>
            <li>
              Interfere with the integrity or performance of the Service, including
              attempting to overload, disable, or impair functionality
            </li>
            <li>
              Use the Service to harass, defame, or impersonate any person or entity
            </li>
            <li>
              Resell, sublicense, or commercially redistribute Service results without
              our written permission
            </li>
          </ul>
          <p className="mt-3">
            We may apply usage limits and may suspend or restrict access if we
            reasonably believe you are violating these Terms.
          </p>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            The Service, including its design, code, copy, branding, and the
            &ldquo;NameClaim&rdquo; mark, is owned by us and protected by copyright,
            trademark, and other laws. We grant you a limited, non-exclusive,
            non-transferable, revocable license to access and use the Service for your
            personal or internal business use, subject to these Terms.
          </p>
          <p className="mt-3">
            You retain all rights to the names you search. By submitting a name, you
            authorize us to process it solely for the purpose of returning results and
            improving the Service.
          </p>
        </Section>

        <Section title="6. Third-Party Data and Services">
          <p>
            The Service surfaces information from third parties such as the United
            States Patent and Trademark Office (USPTO), domain registrars, and social
            media platforms. We do not control these sources, and the data they return
            may be incomplete, delayed, or incorrect. The presence or absence of a
            result for a given name in the Service is not a determination of legal
            availability.
          </p>
          <p className="mt-3">
            Outbound links to third-party services (for example, domain registrars) are
            provided for your convenience. We are not responsible for the content,
            terms, pricing, or practices of any third-party site.
          </p>
        </Section>

        <Section title="7. Affiliate Links">
          <p>
            Some outbound links on the Service are affiliate links, meaning we may earn
            a commission if you purchase through them at no additional cost to you.
            Affiliate relationships do not influence which results we surface. For full
            details, see our{" "}
            <Link href="/affiliate-disclosure" className="underline">
              Affiliate Disclosure
            </Link>
            .
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            <strong>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              without warranties of any kind, express or implied.
            </strong>{" "}
            To the fullest extent permitted by law, we disclaim all warranties,
            including merchantability, fitness for a particular purpose, accuracy,
            non-infringement, and uninterrupted or error-free operation.
          </p>
          <p className="mt-3">
            We make no guarantee that:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Search results are complete, current, or accurate</li>
            <li>
              A name reported as available is in fact legally available for trademark,
              domain, or social media use
            </li>
            <li>The Service will be uninterrupted, secure, or free from errors</li>
            <li>Third-party data sources will be reachable at any given time</li>
          </ul>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, NameClaim and its operators will
            not be liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits, revenue, data, goodwill, or
            business opportunity, arising out of or relating to your use of the
            Service, even if we have been advised of the possibility of such damages.
          </p>
          <p className="mt-3">
            Our total cumulative liability for any claim arising out of or relating to
            the Service will not exceed one hundred U.S. dollars (USD $100).
          </p>
        </Section>

        <Section title="10. Indemnification">
          <p>
            You agree to defend, indemnify, and hold harmless NameClaim and its
            operators from and against any claims, damages, liabilities, costs, and
            expenses (including reasonable attorneys&apos; fees) arising out of (a) your
            use of the Service, (b) your violation of these Terms, or (c) your
            infringement of any third-party right, including any intellectual property
            right.
          </p>
        </Section>

        <Section title="11. Termination">
          <p>
            We may suspend or terminate your access to the Service at any time, with or
            without notice, for any reason, including violation of these Terms. You may
            stop using the Service at any time. Sections that by their nature should
            survive termination (including disclaimers, limitation of liability, and
            indemnification) will survive.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. The &ldquo;Last updated&rdquo;
            date at the top of this page indicates when changes were last made.
            Continued use of the Service after changes take effect constitutes
            acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by the laws of the State of California, without
            regard to its conflict-of-laws principles. You agree that any dispute
            arising out of or relating to these Terms or the Service will be resolved
            exclusively in the state or federal courts located in San Francisco County,
            California, and you consent to the personal jurisdiction of such courts.
          </p>
        </Section>

        <Section title="14. Contact">
          <p className="mb-2">
            Questions about these Terms? Reach us at:
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
