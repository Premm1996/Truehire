import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — TrueHire</title>
        <meta name="description" content="Read our terms of service and understand the rules for using TrueHire platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using TrueHire, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
                <p className="text-gray-700 mb-4">
                  Permission is granted to temporarily access the materials (information or software) on TrueHire's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Account Creation</h3>
                <p className="text-gray-700 mb-4">
                  To access certain features of our platform, you must create an account. You agree to provide accurate, current, and complete information during the registration process.
                </p>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-700 mb-4">
                  You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Job Postings and Applications</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-2">For Employers</h3>
                <p className="text-gray-700 mb-4">
                  Employers agree to post accurate and lawful job opportunities. All job postings must comply with applicable employment laws and regulations.
                </p>
                <h3 className="text-xl font-medium text-gray-900 mb-2">For Job Seekers</h3>
                <p className="text-gray-700 mb-4">
                  Job seekers agree to provide accurate information in their profiles and applications. Misrepresentation may result in account suspension.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
                <p className="text-gray-700 mb-4">
                  You agree not to use the platform for any unlawful purpose or to solicit others to perform unlawful acts. Prohibited activities include but are not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Posting discriminatory or offensive content</li>
                  <li>Harassing or abusing other users</li>
                  <li>Impersonating others or providing false information</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using the platform for spam or unsolicited communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content Ownership</h2>
                <p className="text-gray-700 mb-4">
                  You retain ownership of content you submit to the platform. By submitting content, you grant TrueHire a non-exclusive, royalty-free license to use, display, and distribute your content in connection with our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
                <p className="text-gray-700 mb-4">
                  While we strive to provide continuous service, we do not guarantee that the platform will be available at all times. We reserve the right to modify or discontinue services with reasonable notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  TrueHire shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-700 mb-4">
                  We may terminate or suspend your account and access to the platform immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
                <p className="text-gray-700 mb-4">
                  These terms shall be interpreted and governed by the laws of India, without regard to conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">TrueHire Support Team</p>
                  <p className="text-gray-700">Email: legal@truehire.com</p>
                  <p className="text-gray-700">Phone: +91 63812 50037</p>
                  <p className="text-gray-700">Address: 204, 2nd Floor, Duttisland, Siripuram Junction, Visakhapatnam, Andhra Pradesh, India</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
