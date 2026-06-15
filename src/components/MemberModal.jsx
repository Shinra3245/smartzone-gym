import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { renewMember, deleteMember, memberStatus, getPrices } from '../data/store'
import StatusBadge from './StatusBadge'
import styles from './MemberModal.module.css'

const PLANS = [
  { value: 'dia',    label: 'Día'    },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',    label: 'Mes'    },
]

export default function MemberModal({ member, onClose, onUpdate }) {
  const [prices,       setPrices]       = useState({ dia: 0, semana: 0, mes: 0 })
  const [selectedPlan, setSelectedPlan] = useState(member.plan)
  const [amount,       setAmount]       = useState(0)
  const [confirming,   setConfirming]   = useState(false)
  const [showHistory,  setShowHistory]  = useState(false)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    getPrices().then(p => {
      setPrices(p)
      setAmount(p[member.plan])
    })
  }, [member.plan])

  const status = memberStatus(member)
  const expiry = format(parseISO(member.expiry), "EEEE d 'de' MMMM yyyy", { locale: es })
  const start  = format(parseISO(member.startDate), "d MMM yyyy", { locale: es })
  const payments = [...(member.payments ?? [])].reverse()

  function handlePlanChange(plan) {
    setSelectedPlan(plan)
    setAmount(prices[plan])
  }

  async function handleRenew() {
    setSaving(true)
    await renewMember(member.id, selectedPlan, amount)
    setSaving(false)
    await onUpdate()
    onClose()
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setSaving(true)
    await deleteMember(member.id)
    setSaving(false)
    await onUpdate()
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <div className={`${styles.avatar} ${styles[status]}`}>
            {member.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
          </div>
          <div>
            <h2 className={styles.name}>{member.name}</h2>
            {member.phone && <p className={styles.phone}>{member.phone}</p>}
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className={styles.statusRow}>
          <StatusBadge status={status} size="lg" />
          <span className={styles.paymentCount}>
            {payments.length} {payments.length === 1 ? 'pago' : 'pagos'} registrados
          </span>
        </div>

        <div className={styles.details}>
          <div className={styles.detail}><span className={styles.label}>Plan</span><span className={styles.value}>{member.planLabel}</span></div>
          <div className={styles.detail}><span className={styles.label}>Inicio</span><span className={styles.value}>{start}</span></div>
          <div className={styles.detail}><span className={styles.label}>Vencimiento</span><span className={styles.value}>{expiry}</span></div>
        </div>

        <div className={styles.historySection}>
          <button className={styles.historyToggle} onClick={() => setShowHistory(h => !h)}>
            <span>Historial de pagos</span>
            <span className={styles.historyChevron}>{showHistory ? '▲' : '▼'}</span>
          </button>

          {showHistory && (
            <div className={styles.historyList}>
              {payments.length === 0 ? (
                <p className={styles.historyEmpty}>Sin pagos registrados.</p>
              ) : (
                payments.map((p, i) => (
                  <div key={p.id} className={styles.historyItem}>
                    <div className={styles.timelineDot} />
                    {i < payments.length - 1 && <div className={styles.timelineLine} />}
                    <div className={styles.historyData}>
                      <div className={styles.historyLeft}>
                        <span className={styles.historyPlan}>{p.planLabel}</span>
                        <span className={styles.historyDate}>{format(parseISO(p.date), "d 'de' MMM yyyy", { locale: es })}</span>
                      </div>
                      {p.amount != null && (
                        <span className={styles.historyAmount}>${p.amount.toLocaleString('es-MX')}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Renovar membresía</p>
          <div className={styles.planRow}>
            {PLANS.map(p => (
              <button
                key={p.value}
                className={`${styles.planBtn} ${selectedPlan === p.value ? styles.planSelected : ''}`}
                onClick={() => handlePlanChange(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className={styles.amountRow}>
            <label className={styles.amountLabel}>Monto cobrado</label>
            <div className={styles.amountControl}>
              <button type="button" className={styles.amountBtn} onClick={() => setAmount(a => Math.max(0, Number(a) - 10))}>−</button>
              <div className={styles.amountDisplay}>
                <span className={styles.amountPrefix}>$</span>
                <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className={styles.amountField} />
              </div>
              <button type="button" className={styles.amountBtn} onClick={() => setAmount(a => Number(a) + 10)}>＋</button>
            </div>
          </div>

          <button className={styles.renewBtn} onClick={handleRenew} disabled={saving}>
            {saving ? 'Guardando...' : `Renovar — $${Number(amount).toLocaleString('es-MX')}`}
          </button>
        </div>

        <button
          className={`${styles.deleteBtn} ${confirming ? styles.deleteBtnConfirm : ''}`}
          onClick={handleDelete}
          disabled={saving}
        >
          {confirming ? '¿Confirmar eliminación?' : 'Eliminar miembro'}
        </button>

      </div>
    </div>
  )
}