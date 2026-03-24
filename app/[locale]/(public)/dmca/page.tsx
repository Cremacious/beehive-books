import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description: 'DMCA takedown policy for Beehive Books.',
};

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            ← Beehive Books
          </Link>
          <h1 className="text-3xl font-bold text-white mainFont mt-6 mb-2">
            DMCA Policy
          </h1>
          <p className="text-sm text-white/80">Last updated: March 24, 2025</p>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Overview</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Beehive Books respects intellectual property rights and expects our users to do the
              same. In accordance with the Digital Millennium Copyright Act of 1998 (&quot;DMCA&quot;), we
              will respond expeditiously to claims of copyright infringement that are properly
              submitted to our designated copyright agent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">How to Submit a Takedown Notice</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              If you believe that content on Beehive Books infringes your copyright, please send a
              written notice to our designated agent at{' '}
              <a
                href="mailto:legal@beehive-books.app"
                className="text-yellow-500 hover:text-white transition-colors"
              >
                legal@beehive-books.app
              </a>
              {' '}with the following information:
            </p>
            <ol className="text-sm text-white/80 leading-relaxed space-y-3 list-decimal list-inside">
              <li>
                <span className="text-white font-medium">Identification of the copyrighted work</span> — a
                description of the work you claim has been infringed, including title and, if
                applicable, registration number.
              </li>
              <li>
                <span className="text-white font-medium">Identification of the infringing material</span> — the
                URL or other specific location on Beehive Books of the content you claim is
                infringing.
              </li>
              <li>
                <span className="text-white font-medium">Your contact information</span> — your name,
                mailing address, telephone number, and email address.
              </li>
              <li>
                <span className="text-white font-medium">Good faith statement</span> — a statement that you
                have a good faith belief that use of the material in the manner complained of is
                not authorised by the copyright owner, its agent, or the law.
              </li>
              <li>
                <span className="text-white font-medium">Accuracy statement</span> — a statement that the
                information in your notice is accurate and, under penalty of perjury, that you are
                the copyright owner or are authorised to act on behalf of the copyright owner.
              </li>
              <li>
                <span className="text-white font-medium">Signature</span> — a physical or electronic signature
                of the copyright owner or a person authorised to act on their behalf.
              </li>
            </ol>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              Incomplete or inaccurate notices may not be processed. We will review valid notices
              and remove or disable access to the infringing content promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Counter-Notice Process</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              If you believe your content was removed by mistake or misidentification, you may
              submit a counter-notice to{' '}
              <a
                href="mailto:legal@beehive-books.app"
                className="text-yellow-500 hover:text-white transition-colors"
              >
                legal@beehive-books.app
              </a>
              {' '}containing the following:
            </p>
            <ol className="text-sm text-white/80 leading-relaxed space-y-3 list-decimal list-inside">
              <li>
                <span className="text-white font-medium">Identification of the removed content</span> — the
                URL or description of the content that was removed.
              </li>
              <li>
                <span className="text-white font-medium">Statement under penalty of perjury</span> — a statement
                that you have a good faith belief that the content was removed as a result of
                mistake or misidentification.
              </li>
              <li>
                <span className="text-white font-medium">Your contact information</span> — your name,
                address, telephone number, and email address.
              </li>
              <li>
                <span className="text-white font-medium">Consent to jurisdiction</span> — a statement that
                you consent to the jurisdiction of the Federal District Court for the judicial
                district in which you reside (or, if outside the US, any judicial district in
                which Beehive Books may be found), and that you will accept service of process
                from the person who submitted the original takedown notice.
              </li>
              <li>
                <span className="text-white font-medium">Signature</span> — your physical or electronic
                signature.
              </li>
            </ol>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              Upon receiving a valid counter-notice, we will forward it to the original complainant.
              If the complainant does not file a court action within 10–14 business days, we may
              restore the removed content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Repeat Infringer Policy</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              It is our policy to terminate, in appropriate circumstances, the accounts of users
              who are repeat infringers of intellectual property rights. We consider a user a
              repeat infringer if they have had multiple valid DMCA takedown notices filed against
              content they posted. We reserve the right to determine what constitutes repeat
              infringement at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Misrepresentation Warning</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Under Section 512(f) of the DMCA, any person who knowingly makes a material
              misrepresentation in a takedown notice or counter-notice may be liable for damages,
              including costs and attorneys&apos; fees. Please ensure that your claims are accurate and
              made in good faith before submitting.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Contact Our Copyright Agent</h2>
            <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
              <p className="text-sm text-white font-medium mb-1">Designated Copyright Agent</p>
              <p className="text-sm text-white/80">Beehive Books</p>
              <p className="text-sm text-white/80 mt-1">
                Email:{' '}
                <a
                  href="mailto:legal@beehive-books.app"
                  className="text-yellow-500 hover:text-white transition-colors"
                >
                  legal@beehive-books.app
                </a>
              </p>
              <p className="text-sm text-white/80 mt-2">
                Please use &quot;DMCA Notice&quot; or &quot;DMCA Counter-Notice&quot; in the subject line.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
