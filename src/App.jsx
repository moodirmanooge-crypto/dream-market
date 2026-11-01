import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
const Admin = lazy(() => import('./pages/Admin.jsx'))
const Sponsor = lazy(() => import('./pages/Sponsor.jsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="adm-center"><div className="adm-spin" /></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sponsor" element={<Sponsor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}
