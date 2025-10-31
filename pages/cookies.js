import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Cookie Policy — TrueHire</title>
        <meta name="description" content="Learn about how TrueHire uses cookies and similar technologies to enhance your experience." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you use our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly, including user authentication and security</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous information</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 border-b text-left text-gray-900 font-semibold">Cookie Type</th>
                        <th className="px-4 py-2 border-b text-left text-gray-900 font-semibold">Purpose</th>
                        <th className="px-4 py-2 border-b text-left text-gray-900 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border-b text-gray-700">Session Cookies</td>
                        <td className="px-4 py-2 border-b text-gray-700">Maintain your session while browsing</td>
                        <td className="px-4 py-2 border-b text-gray-700">Until you close your browser</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 border-b text-gray-700">Persistent Cookies</td>
                        <td className="px-4 py-2 border-b text-gray-700">Remember your preferences</td>
                        <td className="px-4 py-2 border-b text-gray-700">Up to 2 years</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b text-gray-700">Third-party Cookies</td>
                        <td className="px-4 py-2 border-b text-gray-700">Analytics and advertising</td>
                        <td className="px-4 py-2 border-b text-gray-700">Varies by provider</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
                <p className="text-gray-700 mb-4">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Most web browsers allow you to control cookies through their settings</li>
                  <li>You can delete all cookies that are already on your computer</li>
                  <li>You can set most browsers to prevent cookies from being placed</li>
                  <li>Note that disabling cookies may affect the functionality of our website</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Some cookies on our website are set by third-party services that appear on our pages. We have no control over these cookies, and they are subject to the respective third party's privacy policy.
                </p>
                <p className="text-gray-700 mb-4">
                  We use the following third-party services that may set cookies:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Google Analytics for website analytics</li>
                  <li>Social media platforms for sharing functionality</li>
                  <li>Advertising networks for targeted advertising</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Updates to This Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
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
