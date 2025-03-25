import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-4">What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website.
            They are widely used to make websites work more efficiently and provide information to the owners of the
            site. Cookies enhance user experience by remembering your preferences and enabling certain features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-4">How We Use Cookies</h2>
          <p> Sen Jewels website uses cookies for various purposes, including:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>
              <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They
              enable core functionality such as security, network management, and account access.
            </li>
            <li>
              <strong>Preference Cookies:</strong> These cookies allow us to remember choices you make and provide
              enhanced, personalized features.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously.
            </li>
            <li>
              <strong>Marketing Cookies:</strong> These cookies are used to track visitors across websites. The
              intention is to display ads that are relevant and engaging for the individual user.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-4">Types of Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr className="bg-[#fdcc17]/20">
                  <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">cookiesAccepted</td>
                  <td className="border border-gray-300 px-4 py-2">Remembers if you have accepted our cookie policy</td>
                  <td className="border border-gray-300 px-4 py-2">1 year</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">_ga</td>
                  <td className="border border-gray-300 px-4 py-2">Used by Google Analytics to distinguish users</td>
                  <td className="border border-gray-300 px-4 py-2">2 years</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">_gid</td>
                  <td className="border border-gray-300 px-4 py-2">Used by Google Analytics to distinguish users</td>
                  <td className="border border-gray-300 px-4 py-2">24 hours</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">_gat</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Used by Google Analytics to throttle request rate
                  </td>
                  <td className="border border-gray-300 px-4 py-2">1 minute</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-4">Managing Cookies</h2>
          <p>
            Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies,
            or to alert you when cookies are being sent. The methods for doing so vary from browser to browser, and from
            version to version. You can however obtain up-to-date information about blocking and deleting cookies via
            these links:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" className="text-[#000000] font-bold hover:underline">
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                 className="text-[#000000] font-bold hover:underline">
              
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                className="text-[#000000] font-bold hover:underline">
              
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                 className="text-[#000000] font-bold hover:underline">
              
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p>Please note that restricting cookies may impact the functionality of our website.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-4">Changes to Our Cookie Policy</h2>
          <p>
            We may update our Cookie Policy from time to time. Any changes will be posted on this page and, where
            appropriate, notified to you when you next visit our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-4">Contact Us</h2>
          <p>If you have any questions about our Cookie Policy, please contact us at:</p>
          <p className="mt-2">
            <strong>Email:</strong> senjutibiswas05@gmail.com
            <br />
            <strong>Number:</strong> +44 7438 919798

          </p>
        </section>

        <div className="mt-8">
          <Button asChild className="bg-[#ffffff] text-[#4A4A4A] hover:bg-[#e0b515]">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
