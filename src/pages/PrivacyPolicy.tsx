import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Privacy Policy | Rosid Syndicates Group'
  }, [])

  return (
    <div className="bg-transparent min-h-screen">
      {/* Header */}
      <div className="print:hidden">
        <PageHeader 
          title="Privacy Policy" 
          subtitle="Legal & Governance" 
          image="https://images.unsplash.com/photo-1497366216548-37526070297c?q=100&w=3840&auto=format&fit=crop"
        />
      </div>

      <div className="hidden print:block print:bg-transparent print:text-ink print:py-12 border-b border-slate-200">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow text-slate-500 uppercase tracking-widest mb-4">Official Document</p>
            <h1 className="text-4xl font-bold tracking-tight leading-tight">Privacy Policy</h1>
            <p className="mt-4 text-xl text-slate-500 font-medium">Rosid Syndicates Group</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-16 print:py-8">
        
        {/* Commitment Statement */}
        <div className="mb-12 p-8 bg-white border-l-4 border-[#FD7B00] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#011E52]">Commitment to Data Privacy</p>
          <p className="text-slate-600 mt-2 leading-relaxed text-sm md:text-base">
            Welcome to <strong>Rosid Syndicates Group</strong> (rosid.com.np). We respect your privacy and are committed to protecting your personal and corporate data.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500 font-medium">
            <span><strong>Last Updated:</strong> August 2026</span>
            <span><strong>Jurisdiction:</strong> Nepal</span>
            <span><strong>Website:</strong> rosid.com.np</span>
          </div>
        </div>

        <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#011E52] prose-a:text-[#FD7B00]">
          
          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-12 mb-6">1. Introduction</h2>
          <p>
            Welcome to <strong>Rosid Syndicates Group</strong> (rosid.com.np). We respect your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, handle, secure, and process information submitted across our corporate portal and throughout our operating subsidiaries in Nepal:
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 my-6 not-prose">
            {[
              'Roshan Enterprises Pvt. Ltd.',
              'Appi Saipal Financial Solutions Pvt. Ltd.',
              'Kasthamandap Commerce and Company Pvt. Ltd.',
              'B & C Exim Company Pvt. Ltd.',
              'Deiyougo Enterprises Pvt. Ltd.'
            ].map((sub) => (
              <div key={sub} className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#FD7B00]"></span>
                <span className="text-sm font-semibold text-[#011E52]">{sub}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-14 mb-6">2. Information We Collect</h2>
          <p>We collect only the necessary information required to facilitate our infrastructure, procurement, financial advisory, and trading services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact Identification:</strong> Full Name, Email Address, and Phone Number (optional).</li>
            <li><strong>Corporate Details:</strong> Company Name and Business Profile.</li>
            <li><strong>Inquiries & Messages:</strong> Messages, questions, and project briefs submitted via our contact forms.</li>
            <li><strong>Tender Submissions:</strong> Tender references, sector details, bid deadlines, support requirements, and uploaded documentation.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, operating system, and device information.</li>
          </ul>

          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-14 mb-6">3. How We Use Your Information</h2>
          <p>We use your data strictly to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respond to your messages, inquiries, and corporate requests.</li>
            <li>Process and evaluate tender bids and procurement requirements.</li>
            <li>Provide requested commercial, advisory, and infrastructure information.</li>
            <li>Improve the performance, security, and quality of our website and services.</li>
          </ul>

          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-14 mb-6">4. Data Protection & Security</h2>
          <p>We maintain comprehensive security measures to safeguard your information against unauthorized access, loss, or alteration:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>SSL Encryption:</strong> High-grade 256-bit encryption for all data transmitted across our web interfaces and API endpoints.</li>
            <li><strong>Secure Storage:</strong> Robust database storage with strict encryption at rest and automated security protocols.</li>
            <li><strong>Access Controls:</strong> Administrative access to inbound submissions is restricted exclusively to authorized corporate personnel.</li>
          </ul>

          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-14 mb-6">5. Your Rights</h2>
          <p>Under the applicable privacy frameworks in Nepal, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Correct:</strong> Request correction or updating of any inaccurate data.</li>
            <li><strong>Request Deletion:</strong> Request the deletion of your personal records from our databases.</li>
            <li><strong>Withdraw Consent:</strong> Revoke previously given consent for communication at any time.</li>
          </ul>

          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-14 mb-6">6. Contact Us</h2>
          <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm not-prose text-ink space-y-2">
            <p className="text-lg font-bold text-[#011E52]">Rosid Syndicates Group</p>
            <p><strong>Address:</strong> New Baneshwor, Kathmandu, Nepal</p>
            <p><strong>Email:</strong> <a href="mailto:rosid2025@outlook.com" className="text-[#FD7B00] font-bold">rosid2025@outlook.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+9779705398939" className="text-[#011E52] font-semibold">+977-9705398939</a></p>
            <p><strong>Website:</strong> <a href="https://rosid.com.np" target="_blank" rel="noopener" className="text-[#011E52] font-bold">rosid.com.np</a></p>
          </div>

          <h2 className="text-2xl md:text-3xl border-b border-slate-200 pb-3 mt-14 mb-6">7. Governing Law</h2>
          <p>
            This Privacy Policy is governed by and construed in accordance with the laws of <strong>Nepal</strong>.
          </p>

          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-sm not-prose">
            <Link to="/terms-conditions" className="text-[#FD7B00] font-bold hover:underline">View Terms & Conditions &rarr;</Link>
            <span className="text-slate-300">|</span>
            <Link to="/cookie-policy" className="text-[#FD7B00] font-bold hover:underline">View Cookie Policy &rarr;</Link>
          </div>

        </article>
      </div>
    </div>
  )
}
