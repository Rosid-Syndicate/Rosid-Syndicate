import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
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
import BlogPost from './pages/BlogPost'
import BlogCategory from './pages/BlogCategory'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import { initAnalytics, trackPageView } from './utils/analytics'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminInquiries from './pages/admin/Inquiries'
import AdminCompanies from './pages/admin/Companies'
import AdminContent from './pages/admin/Content'
import AdminCredentials from './pages/admin/Credentials'
import AdminBlog from './pages/admin/Blog'
import AdminBlogEditor from './pages/admin/BlogEditor'
import AdminCategories from './pages/admin/Categories'

function AppContent() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-slate-600 overflow-x-hidden w-full relative">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#fff',
            borderRadius: 0,
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? "" : "min-h-screen"}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
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
            </Route>
          </Route>

          {/* Public Routes */}
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
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
          <Route path="/service/:slug" element={<ServiceDetail />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
