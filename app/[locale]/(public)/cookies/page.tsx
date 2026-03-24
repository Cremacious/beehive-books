import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for Beehive Books.',
};

export default function CookiesPage() {
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
            Cookie Policy
          </h1>
          <p className="text-sm text-white/80">Last updated: March 24, 2025</p>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">What Are Cookies?</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Cookies are small text files stored on your device by your web browser when you
              visit a website. They allow a website to recognise your device on subsequent visits
              and remember information about your session or preferences. Beehive Books uses
              cookies and similar technologies (such as local storage) to operate the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Cookies We Use</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              We use only the cookies necessary to operate the Service. We do not use advertising
              cookies, tracking pixels, or third-party analytics cookies.
            </p>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm text-white font-medium">Authentication Session Cookie</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 shrink-0">
                    Essential
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-1">
                  Set when you sign in to maintain your authenticated session. This cookie is
                  required for the Service to function — without it you cannot stay logged in.
                </p>
                <p className="text-xs text-white/80">
                  <span className="text-white">Name:</span> better-auth.session_token &nbsp;·&nbsp;
                  <span className="text-white">Duration:</span> 7 days (extended on activity) &nbsp;·&nbsp;
                  <span className="text-white">Provider:</span> Beehive Books (first-party)
                </p>
              </div>

              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm text-white font-medium">CSRF Protection Cookie</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 shrink-0">
                    Essential
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-1">
                  Used to protect against cross-site request forgery attacks. Required for the
                  security of all form submissions and authenticated API requests.
                </p>
                <p className="text-xs text-white/80">
                  <span className="text-white">Duration:</span> Session &nbsp;·&nbsp;
                  <span className="text-white">Provider:</span> Beehive Books (first-party)
                </p>
              </div>

              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm text-white font-medium">Locale / Language Preference</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 shrink-0">
                    Functional
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-1">
                  Remembers your selected language or locale so the correct version of the site
                  is served on subsequent visits.
                </p>
                <p className="text-xs text-white/80">
                  <span className="text-white">Duration:</span> 1 year &nbsp;·&nbsp;
                  <span className="text-white">Provider:</span> Beehive Books (first-party)
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">What We Do NOT Use</h2>
            <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
              <li>Advertising or retargeting cookies</li>
              <li>Third-party analytics cookies (e.g. Google Analytics)</li>
              <li>Social media tracking pixels</li>
              <li>Fingerprinting or cross-site tracking technologies</li>
            </ul>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              We do not share any cookie data with advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">How to Manage Cookies</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
              <li>View which cookies are stored and delete them individually</li>
              <li>Block all cookies or only third-party cookies</li>
              <li>Set your browser to notify you when a cookie is set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              Please note that disabling essential cookies will prevent you from signing in and
              using most features of Beehive Books. Functional cookies can be disabled with only
              minor impact (e.g. your language preference will not be saved between sessions).
            </p>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              Browser-specific instructions for managing cookies:
            </p>
            <ul className="text-sm text-white/80 leading-relaxed space-y-1 list-disc list-inside mt-2">
              <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
              <li>Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Manage Website Data</li>
              <li>Edge: Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">GDPR and Cookie Consent</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Under the GDPR and ePrivacy Directive, essential and functional cookies that are
              strictly necessary to provide the Service do not require explicit consent. We do not
              set any non-essential cookies, so no consent banner is currently required. If we
              introduce optional cookies in the future, we will update this policy and add an
              appropriate consent mechanism.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Changes to This Policy</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              We may update this Cookie Policy from time to time. The &quot;last updated&quot; date at the
              top of this page will reflect any changes. Continued use of the Service after an
              update constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">Contact</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              If you have questions about our use of cookies, contact us at{' '}
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
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
        </div>
      </div>
    </div>
  );
}
