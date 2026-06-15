import { Routes, Route } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CheckAccess from './pages/CheckAccess'
import Members from './pages/Members'
import NewMember from './pages/NewMember'
import Revenue from './pages/Revenue'

export default function App() {
  const { user, loading } = useAuth()

  // Mientras Firebase revisa si hay una sesión guardada en el navegador
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)', fontSize: '14px',
      }}>
        Cargando...
      </div>
    )
  }

  // Sin sesión activa → solo se puede ver el login
  if (!user) {
    return <Login />
  }

  // Con sesión activa → app completa
  return (
    <Layout>
      <Routes>
        <Route path="/"        element={<Dashboard />}    />
        <Route path="/check"   element={<CheckAccess />}  />
        <Route path="/members" element={<Members />}      />
        <Route path="/new"     element={<NewMember />}    />
        <Route path="/revenue" element={<Revenue />}      />
      </Routes>
    </Layout>
  )
}