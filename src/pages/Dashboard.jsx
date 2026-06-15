import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMembers, memberStatus } from '../data/store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMembers().then(m => { setMembers(m); setLoading(false) })
  }, [])

  const stats = useMemo(() => {
    const active   = members.filter(m => memberStatus(m) === 'active')
    const expiring = members.filter(m => memberStatus(m) === 'expiring')
    const expired  = members.filter(m => memberStatus(m) === 'expired')
    return { active, expiring, expired, total: members.length }
  }, [members])

  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  if (loading) return <p style={{ color: 'var(--text-3)' }}>Cargando...</p>

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <p className={styles.date}>{today}</p>
        <h1 className={styles.title}>Buenos días 👋</h1>
      </div>

      <div className={styles.grid}>
        <StatCard label="Activos"   value={stats.active.length}   total={stats.total} color="green" onClick={() => navigate('/members?filter=active')} />
        <StatCard label="Por vencer" value={stats.expiring.length} total={stats.total} color="amber" onClick={() => navigate('/members?filter=expiring')} />
        <StatCard label="Vencidos"  value={stats.expired.length}  total={stats.total} color="red"   onClick={() => navigate('/members?filter=expired')} />
      </div>

      {stats.expiring.length > 0 && (
        <div className={styles.alertBox}>
          <p className={styles.alertTitle}>⚠ Vencen pronto</p>
          <div className={styles.alertList}>
            {stats.expiring.map(m => (
              <div key={m.id} className={styles.alertItem}>
                <span className={styles.alertName}>{m.name}</span>
                <span className={styles.alertPlan}>{m.planLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={() => navigate('/check')}>
          <span className={styles.actionIcon}>🔍</span>
          <span>Verificar acceso</span>
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/new')}>
          <span className={styles.actionIcon}>＋</span>
          <span>Nuevo miembro</span>
        </button>
      </div>

    </div>
  )
}

function StatCard({ label, value, total, color, onClick }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <button className={`${styles.card} ${styles[color]}`} onClick={onClick}>
      <p className={styles.cardLabel}>{label}</p>
      <p className={styles.cardValue}>{value}</p>
      <div className={styles.bar}><div className={styles.barFill} style={{ width: `${pct}%` }} /></div>
      <p className={styles.cardPct}>{pct}% del total</p>
    </button>
  )
}