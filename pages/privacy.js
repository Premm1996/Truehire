import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — TrueHire</title>
        <meta name="description" content="Learn about how TrueHire collects, uses, and protects your personal information." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                  At TrueHire, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700 mb-4">
                  We may collect personal information such as your name, email address, phone number, resume, work experience, education, and other information you provide when creating an account or applying for jobs.
                </p>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Usage Information</h3>
                <p className="text-gray-700 mb-4">
                  We collect information about how you use our platform, including pages visited, time spent on the site, and interactions with our features.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>To provide and maintain our job matching services</li>
                  <li>To communicate with you about job opportunities and platform updates</li>
                  <li>To improve our platform and develop new features</li>
                  <li>To ensure compliance with legal obligations</li>
                  <li>To prevent fraud and maintain platform security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Employers when you apply for jobs through our platform</li>
                  <li>Service providers who assist us in operating our platform</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-700 mb-4">
                  You have the right to access, update, or delete your personal information. You may also opt out of certain communications. To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">TrueHire Support Team</p>
                  <p className="text-gray-700">Email: privacy@truehire.com</p>
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
