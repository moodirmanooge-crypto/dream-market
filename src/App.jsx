import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
const Admin = lazy(() => import('./pages/Admin.jsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="admin admin--center">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}
