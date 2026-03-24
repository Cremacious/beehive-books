import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Beehive Books.',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-white/80">Last updated: March 24, 2026</p>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              By accessing or using Beehive Books (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, do not use the Service.
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">2. User Accounts</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              You must create an account to access most features of Beehive Books. You are
              responsible for maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              You agree to provide accurate, current, and complete information when creating your
              account. You must be at least 13 years old to use the Service.
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these Terms,
              engage in fraudulent activity, or remain inactive for an extended period, with or
              without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">3. Content Ownership</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              <span className="text-white font-medium">You own your writing.</span> All original
              content you create and publish on Beehive Books — including books, chapters, and
              writing prompts — remains your intellectual property. We do not claim ownership over
              your creative work.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              By posting content on Beehive Books, you grant us a non-exclusive, worldwide,
              royalty-free licence to display, store, and distribute your content solely for the
              purpose of operating and improving the Service. This licence ends when you delete your
              content or account.
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              You are solely responsible for the content you post and represent that you have all
              necessary rights to publish it. You must not post content that infringes on the
              intellectual property rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">4. Acceptable Use</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">You agree not to:</p>
            <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
              <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Post content that sexually exploits or harms minors in any way</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
              <li>Use automated tools to scrape, crawl, or extract content without our written permission</li>
              <li>Spam, solicit, or engage in unsolicited commercial communications</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Post content that infringes any copyright, trademark, or other intellectual property right</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">5. Termination</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              You may delete your account at any time from your account settings. Upon deletion,
              your content will be removed from the Service within a reasonable time, subject to
              any legal obligations to retain data.
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at our sole
              discretion, with or without cause, and with or without notice. We will make reasonable
              efforts to notify you of termination unless doing so would be unlawful or would
              compromise security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">6. Disclaimers and Limitation of Liability</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              express or implied, including but not limited to warranties of merchantability, fitness
              for a particular purpose, or non-infringement.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              To the fullest extent permitted by applicable law, Beehive Books shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages arising from
              your use of the Service, including loss of data, loss of revenue, or loss of goodwill.
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              Our total liability to you for any claim arising out of or relating to these Terms or
              the Service shall not exceed the amount you paid us in the twelve months preceding the
              claim, or $50, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">7. Changes to These Terms</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              We may update these Terms from time to time. We will notify you of material changes
              by posting a notice on the Service or by email. Your continued use of the Service
              after changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">8. Contact</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              If you have questions about these Terms, please contact us at{' '}
              <a
                href="mailto:legal@beehive-books.app"
                className="text-yellow-500 hover:text-white transition-colors"
              >
                legal@beehive-books.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
