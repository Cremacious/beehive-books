import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Beehive Books.',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-white/80">Last updated: March 24, 2026</p>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">1. Introduction</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Beehive Books is committed to protecting your personal data.
              This Privacy Policy explains what information we collect, how we use it, with whom
              we share it, and your rights in relation to it. It applies to all users of
              beehive-books.app and related services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">2. Data We Collect</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              We collect the following categories of personal data:
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white font-medium mb-1">Account Information</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Email address, username, profile picture, bio, and password (stored as a
                  cryptographic hash). If you sign in with Google, we receive your name, email,
                  and profile picture from Google.
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Content You Create</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Books, chapters, comments, reading lists, writing prompt entries, club discussions,
                  and any other content you publish on the platform.
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Usage Data</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Information about how you interact with the Service, including pages visited,
                  features used, reading progress, and activity timestamps.
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Technical Data</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  IP address, browser type, device information, and session identifiers collected
                  automatically when you use the Service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">3. How We Use Your Data</h2>
            <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
              <li>To create and manage your account and authenticate your sessions</li>
              <li>To provide, operate, and improve the Service</li>
              <li>To display your content to you and, where you choose, to other users</li>
              <li>To send you service-related notifications (account updates, friend requests)</li>
              <li>To enforce our Terms of Service and prevent abuse</li>
              <li>To comply with legal obligations</li>
              <li>To generate anonymised, aggregated analytics about platform usage</li>
            </ul>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              We do not sell your personal data to third parties. We do not use your data for
              advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">4. Third-Party Services</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              We use the following third-party services to operate Beehive Books:
            </p>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <p className="text-sm text-white font-medium mb-1">Neon (PostgreSQL)</p>
                <p className="text-sm text-white/80">
                  Our primary database provider. All user data and content is stored in Neon&apos;s
                  managed PostgreSQL service. Data is stored in the EU or US depending on your
                  region.
                </p>
              </div>
              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <p className="text-sm text-white font-medium mb-1">Cloudinary</p>
                <p className="text-sm text-white/80">
                  Used for storing and serving images, including book cover artwork and profile
                  pictures. Images you upload are stored on Cloudinary&apos;s CDN.
                </p>
              </div>
              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <p className="text-sm text-white font-medium mb-1">Stripe</p>
                <p className="text-sm text-white/80">
                  Used for processing payments for premium subscriptions. Stripe handles all
                  payment card data directly — we never see or store your card details.
                </p>
              </div>
              <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <p className="text-sm text-white font-medium mb-1">Google OAuth</p>
                <p className="text-sm text-white/80">
                  If you choose to sign in with Google, your basic profile information (name,
                  email, picture) is shared with us by Google as part of the authentication flow.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">5. Data Retention</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to
              provide the Service. When you delete your account, we will delete or anonymise your
              personal data within 30 days, except where we are required to retain it by law (for
              example, financial records related to payments may be retained for up to 7 years).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">6. Your Rights</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal
              data:
            </p>
            <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
              <li><span className="text-white">Access:</span> Request a copy of the personal data we hold about you</li>
              <li><span className="text-white">Rectification:</span> Correct inaccurate or incomplete data</li>
              <li><span className="text-white">Erasure:</span> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li><span className="text-white">Portability:</span> Receive your data in a structured, machine-readable format</li>
              <li><span className="text-white">Objection:</span> Object to certain types of processing, including direct marketing</li>
              <li><span className="text-white">Restriction:</span> Request that we restrict processing of your data in certain circumstances</li>
            </ul>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a
                href="mailto:legal@beehive-books.app"
                className="text-yellow-500 hover:text-white transition-colors"
              >
                legal@beehive-books.app
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">7. GDPR (EU/EEA Users)</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-3">
              If you are located in the European Union or European Economic Area, the following
              additional provisions apply under the General Data Protection Regulation (GDPR).
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white font-medium mb-1">Lawful Basis for Processing</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  We process your data on the following lawful bases: (a) <em>contract</em> — to
                  provide the Service you have signed up for; (b) <em>legitimate interests</em> —
                  to improve and secure the Service; (c) <em>legal obligation</em> — to comply with
                  applicable law; and (d) <em>consent</em> — where you have explicitly opted in,
                  such as for marketing communications.
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Data Subject Rights</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  EU/EEA residents have the right to lodge a complaint with their local supervisory
                  authority if they believe their data has been processed unlawfully. You may also
                  contact us directly at{' '}
                  <a
                    href="mailto:legal@beehive-books.app"
                    className="text-yellow-500 hover:text-white transition-colors"
                  >
                    legal@beehive-books.app
                  </a>
                  .
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">International Transfers</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Your data may be transferred to and processed in countries outside the EEA,
                  including the United States. Where such transfers occur, we ensure appropriate
                  safeguards are in place, such as Standard Contractual Clauses.
                </p>
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">EU Representative</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  At present, Beehive Books does not have a designated EU representative. If you
                  have GDPR-related enquiries, please contact us at{' '}
                  <a
                    href="mailto:legal@beehive-books.app"
                    className="text-yellow-500 hover:text-white transition-colors"
                  >
                    legal@beehive-books.app
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">8. Security</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              We implement appropriate technical and organisational measures to protect your
              personal data against unauthorised access, alteration, disclosure, or destruction.
              Passwords are stored using strong cryptographic hashing. All data in transit is
              encrypted via HTTPS/TLS. However, no method of transmission over the internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">9. Cookies</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              We use cookies and similar technologies to maintain your session and remember your
              preferences. For full details, see our{' '}
              <Link href="/cookies" className="text-yellow-500 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">10. Changes to This Policy</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting a notice on the Service or by email. The &quot;last updated&quot; date at
              the top of this page indicates when the policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">11. Contact</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              For privacy-related questions or to exercise your rights, contact us at{' '}
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
          <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
