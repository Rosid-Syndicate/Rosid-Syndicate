import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { CONTACT, SITE_HOST, SITE_URL } from '../config/site'

export default function CookiePolicy() {
  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Cookie Policy"
        description="How the Rosid Syndicates Group website uses cookies and similar technologies, the types of cookies involved, and how to manage them in your browser."
        path="/cookie-policy"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Cookie Policy', path: '/cookie-policy' }]}
      />
      {/* Header */}
      <div className="print:hidden">
        <PageHeader 
          title="Cookie Policy" 
          subtitle="Web Security & Preferences" 
          image="https://images.unsplash.com/photo-1554469384-e58fac16e23a"
          compact
        />
      </div>

      <div className="hidden print:block print:bg-transparent print:text-ink print:py-12 border-b border-line">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow text-muted uppercase tracking-widest mb-4">Web Security Document</p>
            <h1 className="text-4xl font-bold tracking-tight leading-tight">Cookie Policy</h1>
            <p className="mt-4 text-xl text-muted font-medium">Rosid Syndicates Group</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-16 print:py-8">
        
        {/* Notice Card */}
        <div className="mb-12 p-8 bg-white border-l-4 border-accent shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-ink">Transparency on Tracking</p>
          <p className="text-muted mt-2 leading-relaxed text-sm md:text-base">
            This Cookie Policy explains how <strong>Rosid Syndicates Group</strong> (rosid.com.np) uses cookies and similar technologies on your device.
          </p>
          <div className="mt-4 pt-4 border-t border-line flex flex-wrap gap-6 text-xs text-muted font-medium">
            <span><strong>Last Updated:</strong> August 2026</span>
            <span><strong>Jurisdiction:</strong> Nepal</span>
            <span><strong>Website:</strong> {SITE_HOST}</span>
          </div>
        </div>

        <article className="prose-body">
          
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device.
          </p>

          <h2>How We Use Cookies</h2>
          <p>We use cookies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ensure website functionality</li>
            <li>Analyze traffic</li>
            <li>Remember preferences</li>
          </ul>

          <h2>Types of Cookies</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Essential:</strong> Required for operation</li>
            <li><strong>Analytics:</strong> Traffic analysis</li>
            <li><strong>Preference:</strong> User settings</li>
          </ol>

          <h2>Managing Cookies</h2>
          <p>
            Control cookies through your browser settings.
          </p>

          <h2>Contact Us</h2>
          <div className="bg-white p-6 rounded-sm border border-line shadow-sm not-prose text-ink space-y-2">
            <p className="text-lg font-bold text-ink">Rosid Syndicates Group</p>
            <p><strong>Address:</strong> New Baneshwor, Kathmandu, Nepal</p>
            <p><strong>Email:</strong> <a href={`mailto:${CONTACT.email}`} className="text-accent-text font-bold">{CONTACT.email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:+9779705398939" className="text-ink font-semibold">+977-9705398939</a></p>
            <p><strong>Website:</strong> <a href={SITE_URL} className="text-ink font-bold">{SITE_HOST}</a></p>
          </div>

          <div className="mt-12 pt-6 border-t border-line flex flex-wrap gap-4 text-sm not-prose">
            <Link to="/privacy-policy" className="text-accent-text font-bold hover:underline">&larr; View Privacy Policy</Link>
            <span className="text-slate-300">|</span>
            <Link to="/terms-conditions" className="text-accent-text font-bold hover:underline">View Terms & Conditions &rarr;</Link>
          </div>

        </article>
      </div>
    </div>
  )
}
