import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/common/ProtectedRoute'
import ComingSoon from './components/common/ComingSoon'
import Dashboard from './pages/student/Dashboard'
import Internships from './pages/Internships'
import InternshipDetails from './pages/InternshipDetails'
import Mentorship from './pages/Mentorship'
import Profile from './pages/Profile'
import Recommendations from './pages/Recommendations'
import RecommendationDetails from './pages/RecommendationDetails'
import SkillGap from './pages/SkillGap'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Internship browsing is public - saving/applying still requires login */}
      <Route path="/internships" element={<Internships />} />
      <Route path="/internships/:id" element={<InternshipDetails />} />
      <Route path="/mentorship" element={<Mentorship />} />

      {/* Student (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume" element={<ComingSoon title="Resume" phase="Phase 4" />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/recommendations/:id" element={<RecommendationDetails />} />
        <Route path="/saved" element={<ComingSoon title="Saved Internships" phase="Phase 5" />} />
        <Route path="/applications" element={<ComingSoon title="My Applications" phase="Phase 7" />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/notifications" element={<ComingSoon title="Notifications" phase="Phase 7" />} />
      </Route>

      {/* Admin (protected + role-gated) */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<ComingSoon title="Admin Dashboard" phase="Phase 8" />} />
        <Route path="/admin/students" element={<ComingSoon title="Manage Students" phase="Phase 8" />} />
        <Route path="/admin/internships" element={<ComingSoon title="Manage Internships" phase="Phase 8" />} />
        <Route path="/admin/analytics" element={<ComingSoon title="Analytics" phase="Phase 8" />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<ComingSoon title="Page Not Found" phase="n/a" />} />
    </Routes>
  )
}

export default App
