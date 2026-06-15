import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addMember, getPrices } from '../data/store'
import styles from './NewMember.module.css'

const PLANS = [
  { value: 'dia',    label: 'Día',    desc: 'Válido por 1 día'   },
  { value: 'semana', label: 'Semana', desc: 'Válido por 7 días'  },
  { value: 'mes',    label: 'Mes',    desc: 'Válido por 30 días' },
]

export default function NewMember() {
  const navigate = useNavigate()

  const [prices, setPrices] = useState({ dia: 0, semana: 0, mes: 0 })
  const [form,   setForm]   = useState({ name: '', phone: '', plan: 'mes' })
  const [amount, setAmount] = useState(0)
  const [error,  setError]  = useState('')
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPrices().then(p => { setPrices(p); setAmount(p['mes']) })
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  function handlePlanChange(plan) {
    setForm(f => ({ ...f, plan }))
    setAmount(prices[plan])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre del miembro es obligatorio.')
      return
    }
    setSaving(true)
    await addMember({ ...form, amount })
    setSaving(false)
    setSaved(true)
    setTimeout(() => navigate('/members'), 1200)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Nuevo miembro</h1>
      <p className={styles.sub}>Registra los datos del miembro. Solo el nombre es obligatorio.</p>

      {saved ? (
        <div className={styles.success}>
          <span className={styles.successIcon}>✓</span>
          <p>Miembro registrado correctamente. Redirigiendo...</p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Nombre completo *</label>
            <input id="name" name="name" type="text" className={styles.input} placeholder="Ej: Carlos Mendoza" value={form.name} onChange={handleChange} autoFocus />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">Teléfono <span className={styles.optional}>(opcional)</span></label>
            <input id="phone" name="phone" type="tel" className={styles.input} placeholder="Ej: 461-555-0100" value={form.phone} onChange={handleChange} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tipo de membresía</label>
            <div className={styles.planGrid}>
              {PLANS.map(p => (
                <button type="button" key={p.value} className={`${styles.planCard} ${form.plan === p.value ? styles.planSelected : ''}`} onClick={() => handlePlanChange(p.value)}>
                  <span className={styles.planLabel}>{p.label}</span>
                  <span className={styles.planDesc}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Monto cobrado</label>
            <div className={styles.amountControl}>
              <button type="button" className={styles.amountBtn} onClick={() => setAmount(a => Math.max(0, Number(a) - 10))}>−</button>
              <div className={styles.amountDisplay}>
                <span className={styles.amountPrefix}>$</span>
                <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className={styles.amountField} />
              </div>
              <button type="button" className={styles.amountBtn} onClick={() => setAmount(a => Number(a) + 10)}>＋</button>
            </div>
            <span className={styles.amountHint}>Precio base: ${prices[form.plan]?.toLocaleString('es-MX')}</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/members')}>Cancelar</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Guardando...' : `Registrar — $${Number(amount).toLocaleString('es-MX')}`}
            </button>
          </div>

        </form>
      )}
    </div>
  )
}