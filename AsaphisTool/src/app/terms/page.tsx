import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - AsaPhisTool',
  description: 'Terms of Service for AsaPhisTool - Read our terms and conditions for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Terms of Service
        </h1>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AsaPhisTool ("the Service"), you accept and agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
            <p>
              AsaPhisTool provides a collection of free online tools and utilities including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Image processing tools (compression, resizing, format conversion)</li>
              <li>PDF manipulation tools (merging, splitting, compression)</li>
              <li>Text and data tools (encoding, formatting, conversion)</li>
              <li>Developer tools (JSON formatting, hash generation, UUID creation)</li>
              <li>Security tools (password generation, strength checking)</li>
              <li>Generator tools (QR codes, lorem ipsum)</li>
            </ul>
            <p className="mt-4">
              Most tools process data locally in your browser. Some premium features may require server-side processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Use the Service only for lawful purposes</li>
              <li>Not upload or process any illegal, harmful, or malicious content</li>
              <li>Not attempt to breach, hack, or compromise the Service's security</li>
              <li>Not use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Respect intellectual property rights of others</li>
              <li>Not use the Service to violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Intellectual Property</h2>
            <p>
              The Service, including its design, code, features, and content, is owned by AsaPhis and 
              protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-4">
              <strong>Your Content:</strong> You retain all rights to files and content you process using our tools. 
              We do not claim ownership of your content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Privacy and Data</h2>
            <p>
              Your use of the Service is also governed by our <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
            </p>
            <p className="mt-4">
              <strong>Client-Side Processing:</strong> Most tools process data entirely in your browser. We do not 
              store or have access to files processed through client-side tools.
            </p>
            <p className="mt-4">
              <strong>Server-Side Processing:</strong> Some premium features may require server processing. When using 
              these features, files are temporarily processed on our servers and immediately deleted after processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or completeness of results</li>
            </ul>
            <p className="mt-4">
              We do not guarantee that the Service will be uninterrupted, error-free, or secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AsaPhis shall not be liable for any:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from use or inability to use the Service</li>
              <li>Damages resulting from errors, bugs, or service interruptions</li>
            </ul>
            <p className="mt-4">
              Our total liability shall not exceed $100 USD or the amount you paid to use the Service (if any).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Service Availability</h2>
            <p>
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Modify, suspend, or discontinue the Service at any time</li>
              <li>Change features, pricing, or availability without notice</li>
              <li>Refuse service to anyone for any reason</li>
              <li>Set usage limits or restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Premium Features</h2>
            <p>
              Some features may be designated as "Premium" and require payment or subscription. Premium features are subject to additional terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Third-Party Links and Services</h2>
            <p>
              The Service may contain links to third-party websites or services. We are not responsible for the 
              content, privacy policies, or practices of third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless AsaPhis from any claims, damages, losses, liabilities, 
              and expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon 
              posting. Your continued use of the Service constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, 
              for any reason, including breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">15. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p><strong>Email:</strong> legal@asaphis.com</p>
              <p className="mt-2"><strong>Website:</strong> <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">Contact Form</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain 
              in full force and effect.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
