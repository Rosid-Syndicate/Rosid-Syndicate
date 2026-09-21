import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import ScrollManager from './components/ScrollManager'
import Home from './pages/Home'
import { initAnalytics, trackPageView } from './utils/analytics'

// Route-level code splitting. The home page stays in the main bundle (it is the
// LCP-critical route); everything else — and the entire admin — loads on demand.
// Before this change a single 714 kB chunk shipped the admin, blog editor and
// every policy page to every visitor.
import ProjectDetail from './pages/ProjectDetail'
import ServiceDetail from './pages/ServiceDetail'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import AppiSaipal from './pages/AppiSaipal'
import ForeignContractorWorkflow from './pages/ForeignContractorWorkflow'
import ProjectsPage from './pages/Projects'
import GroupStructure from './pages/GroupStructure'
import CorporateProfile from './pages/CorporateProfile'
import Procurement from './pages/Procurement'
import TenderInquiry from './pages/TenderInquiry'
import CredentialsPage from './pages/Credentials'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import CookiePolicy from './pages/CookiePolicy'
import Blog from './pages/Blog'
const BlogPost = lazy(() => import('./pages/BlogPost'))
const BlogCategory = lazy(() => import('./pages/BlogCategory'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminArea = lazy(() => import('./components/AdminArea'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const AdminLayout = lazy(() => import('./components/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminResetPassword = lazy(() => import('./pages/admin/ResetPassword'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminInquiries = lazy(() => import('./pages/admin/Inquiries'))
const AdminCompanies = lazy(() => import('./pages/admin/Companies'))
const AdminContent = lazy(() => import('./pages/admin/Content'))
const AdminCredentials = lazy(() => import('./pages/admin/Credentials'))
const AdminBlog = lazy(() => import('./pages/admin/Blog'))
const AdminBlogEditor = lazy(() => import('./pages/admin/BlogEditor'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'))
const AdminFaqs = lazy(() => import('./pages/admin/Faqs'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))

function RouteFallback() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100]" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-full bg-accent animate-[pulse_1s_ease-in-out_infinite] origin-left" style={{ animationName: 'loading-bar', animationDuration: '1.5s', animationIterationCount: 'infinite' }} aria-hidden="true" />
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(0); }
          50% { width: 50%; transform: translateX(50vw); }
          100% { width: 100%; transform: translateX(100vw); }
        }
      `}</style>
    </div>
  )
}

/** Route tree + chrome. Rendered inside BrowserRouter on the client and StaticRouter at build time (scripts/prerender.mjs). */
export function AppContent() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas text-muted overflow-x-hidden w-full relative">
      <a href="#main" className="skip-link">Skip to main content</a>
      <ScrollManager />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#011E52', color: '#fff', borderRadius: 2, fontSize: '13px', fontWeight: 600 },
          success: { iconTheme: { primary: '#FD7B00', secondary: '#011E52' } },
        }}
      />
      {!isAdmin && <Navbar />}
      <main id="main" tabIndex={-1} className={isAdmin ? 'min-h-screen outline-none' : 'outline-none'}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Admin (client-guarded; data access is enforced server-side by RLS).
                AdminArea provides the auth context and is lazy-loaded so public
                pages never download the Supabase client or run a session check. */}
            <Route element={<AdminArea />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout><Outlet /></AdminLayout>}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/companies" element={<AdminCompanies />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/credentials" element={<AdminCredentials />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/blog/create" element={<AdminBlogEditor />} />
                <Route path="/admin/blog/edit/:id" element={<AdminBlogEditor />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/faqs" element={<AdminFaqs />} />
                </Route>
                {/* admin-only areas */}
                <Route element={<ProtectedRoute requireRole="admin" />}>
                  <Route element={<AdminLayout><Outlet /></AdminLayout>}>
                    <Route path="/admin/users" element={<AdminUsers />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/blog/category/:slug" element={<BlogCategory />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/appi-saipal-financial-solutions" element={<AppiSaipal />} />
            <Route path="/companies/:slug" element={<CompanyDetail />} />
            <Route path="/infrastructure-tender-services" element={<ForeignContractorWorkflow />} />
            <Route path="/group-structure" element={<GroupStructure />} />
            <Route path="/corporate-profile" element={<CorporateProfile />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/tender-inquiry" element={<TenderInquiry />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            {/* Legacy duplicate URL → single canonical route */}
            <Route path="/terms-and-conditions" element={<Navigate to="/terms-conditions" replace />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="/service/:slug" element={<ServiceDetail />} />

            {/* Unknown routes render a real 404 view (noindex) instead of redirecting home */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      {/* Vercel Speed Insights: same-origin script + beacon (/_vercel/…), so the
          CSP needs nothing beyond 'self'. Client only — not part of the prerender. */}
      <SpeedInsights />
      <Analytics />
    </BrowserRouter>
  )
}
