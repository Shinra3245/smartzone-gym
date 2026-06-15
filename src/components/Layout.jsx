import { NavLink } from 'react-router-dom'
import styles from './Layout.module.css'
import { useAuth } from '../auth/AuthContext'
import Logo from './Logo'

// Iconos SVG inline — sin dependencia externa, carga instantánea
const icons = {
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="16"/>
    </svg>
  ),
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>

        {/* Logo + nombre del gym */}
        <div className={styles.brand}>
          <Logo size={32} />
          <div>
            <p className={styles.brandName}>SmartZone</p>
            <p className={styles.brandSub}>Sistema de membresías</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            {icons.home}
            <span>Inicio</span>
          </NavLink>
          <NavLink to="/check" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            {icons.check}
            <span>Verificar acceso</span>
          </NavLink>
          <NavLink to="/members" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            {icons.users}
            <span>Miembros</span>
          </NavLink>
          <NavLink to="/new" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            {icons.plus}
            <span>Nuevo miembro</span>
          </NavLink>
          <NavLink to="/revenue" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            {icons.chart}
            <span>Ingresos</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            {icons.settings}
            <span>Configuración</span>
          </NavLink>
        </nav>

        {/* Footer del sidebar — correo del usuario + cerrar sesión */}
        {/* Hermano directo de .brand y .nav, no anidado dentro de ellos */}
        <div className={styles.footer}>
          <p className={styles.userEmail}>{user?.email}</p>
          <button className={styles.logoutBtn} onClick={logout}>
            Cerrar sesión
          </button>
        </div>

      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}