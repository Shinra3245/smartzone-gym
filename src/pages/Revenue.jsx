import { useMemo, useState, useEffect } from 'react'
import { getAllPayments } from '../data/store'
import {
  format, parseISO,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  isWithinInterval
} from 'date-fns'
import { es } from 'date-fns/locale'
import { generateWeeklyReport } from '../utils/generateReport'
import styles from './Revenue.module.css'

const PLAN_COLORS = { dia: 'amber', semana: 'blue', mes: 'green' }

export default function Revenue() {
  const [view,       setView]       = useState('week')
  const [generating, setGenerating] = useState(false)
  const [payments,   setPayments]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const now = new Date()

  useEffect(() => {
    getAllPayments().then(p => { setPayments(p); setLoading(false) })
  }, [])

  const interval = useMemo(() => {
    if (view === 'week') return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end:   endOfWeek(now,   { weekStartsOn: 1 }),
    }
    return { start: startOfMonth(now), end: endOfMonth(now) }
  }, [view])

  const periodPayments = useMemo(() =>
    payments.filter(p => isWithinInterval(parseISO(p.date), interval)),
    [payments, interval]
  )

  const total = periodPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const byPlan = useMemo(() => {
    const groups = { dia: { count: 0, amount: 0 }, semana: { count: 0, amount: 0 }, mes: { count: 0, amount: 0 } }
    periodPayments.forEach(p => {
      if (groups[p.plan]) {
        groups[p.plan].count  += 1
        groups[p.plan].amount += p.amount ?? 0
      }
    })
    return groups
  }, [periodPayments])

  const byMember = useMemo(() => {
    const map = {}
    periodPayments.forEach(p => {
      if (!map[p.memberId]) map[p.memberId] = { memberId: p.memberId, memberName: p.memberName, total: 0, payments: [] }
      map[p.memberId].total    += p.amount ?? 0
      map[p.memberId].payments.push(p)
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [periodPayments])

  const periodLabel = view === 'week'
    ? `${format(interval.start, "d MMM", { locale: es })} – ${format(interval.end, "d MMM yyyy", { locale: es })}`
    : format(now, "MMMM yyyy", { locale: es })

  function handleDownload() {
    setGenerating(true)
    setTimeout(() => {
      try {
        generateWeeklyReport({ interval, periodLabel, total, byPlan, byMember, periodPayments })
      } finally {
        setGenerating(false)
      }
    }, 0)
  }

  if (loading) return <p style={{ color: 'var(--text-3)' }}>Cargando...</p>

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.title}>Ingresos</h1>
        <div className={styles.headerRight}>
          <div className={styles.toggle}>
            <button className={`${styles.toggleBtn} ${view === 'week' ? styles.toggleActive : ''}`} onClick={() => setView('week')}>Esta semana</button>
            <button className={`${styles.toggleBtn} ${view === 'month' ? styles.toggleActive : ''}`} onClick={() => setView('month')}>Este mes</button>
          </div>
          <button className={styles.downloadBtn} onClick={handleDownload} disabled={generating || periodPayments.length === 0}>
            {generating ? <span className={styles.downloadSpinner}>⟳</span> : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {generating ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      <p className={styles.periodLabel}>{periodLabel}</p>

      <div className={styles.totalCard}>
        <p className={styles.totalLabel}>Total cobrado</p>
        <p className={styles.totalAmount}>${total.toLocaleString('es-MX')}</p>
        <p className={styles.totalSub}>{periodPayments.length} {periodPayments.length === 1 ? 'pago' : 'pagos'} · {byMember.length} {byMember.length === 1 ? 'miembro' : 'miembros'}</p>
      </div>

      <div className={styles.breakdown}>
        {Object.entries(byPlan).map(([plan, data]) => (
          <div key={plan} className={`${styles.breakdownCard} ${styles[PLAN_COLORS[plan]]}`}>
            <p className={styles.breakdownPlan}>{plan === 'dia' ? 'Día' : plan === 'semana' ? 'Semana' : 'Mes'}</p>
            <p className={styles.breakdownAmount}>${data.amount.toLocaleString('es-MX')}</p>
            <p className={styles.breakdownCount}>{data.count} {data.count === 1 ? 'pago' : 'pagos'}</p>
            <div className={styles.breakdownBar}>
              <div className={styles.breakdownFill} style={{ width: total > 0 ? `${Math.round((data.amount / total) * 100)}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.listSection}>
        <p className={styles.listTitle}>Detalle por miembro</p>
        {byMember.length === 0 ? (
          <div className={styles.empty}>Sin pagos registrados en este período.</div>
        ) : (
          <div className={styles.list}>
            {byMember.map(m => <MemberPaymentRow key={m.memberId} data={m} />)}
          </div>
        )}
      </div>

    </div>
  )
}

function MemberPaymentRow({ data }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.memberCard}>
      <button className={styles.memberRow} onClick={() => setOpen(o => !o)}>
        <div className={styles.memberAvatar}>{data.memberName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>
        <div className={styles.memberInfo}>
          <span className={styles.memberName}>{data.memberName}</span>
          <span className={styles.memberMeta}>{data.payments.length} {data.payments.length === 1 ? 'pago' : 'pagos'} en el período</span>
        </div>
        <div className={styles.memberRight}>
          <span className={styles.memberTotal}>${data.total.toLocaleString('es-MX')}</span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▼</span>
        </div>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {data.payments.map(p => (
            <div key={p.id} className={styles.dropdownRow}>
              <span className={styles.dropdownPlan}>{p.planLabel}</span>
              <span className={styles.dropdownDate}>{format(parseISO(p.date), "d 'de' MMM, HH:mm", { locale: es })}</span>
              <span className={styles.dropdownAmount}>${(p.amount ?? 0).toLocaleString('es-MX')}</span>
            </div>
          ))}
          {data.payments.length > 1 && (
            <div className={styles.dropdownSubtotal}><span>Total del período</span><span>${data.total.toLocaleString('es-MX')}</span></div>
          )}
        </div>
      )}
    </div>
  )
}