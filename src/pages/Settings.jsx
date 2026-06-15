import { useState, useEffect } from 'react'
import { getPrices, savePrices } from '../data/store'
import styles from './Settings.module.css'

const PLANS = [
  { key: 'dia',    label: 'Día',    desc: 'Precio por 1 día'   },
  { key: 'semana', label: 'Semana', desc: 'Precio por 7 días'  },
  { key: 'mes',    label: 'Mes',    desc: 'Precio por 30 días' },
]

export default function Settings() {
  const [prices,  setPrices]  = useState({ dia: 0, semana: 0, mes: 0 })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    getPrices().then(p => { setPrices(p); setLoading(false) })
  }, [])

  function handleChange(key, value) {
    setPrices(p => ({ ...p, [key]: value }))
    setSaved(false)
  }

  function adjust(key, delta) {
    setPrices(p => ({ ...p, [key]: Math.max(0, Number(p[key]) + delta) }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    // Asegura que se guarden como números, no strings del input
    const normalized = {
      dia:    Number(prices.dia),
      semana: Number(prices.semana),
      mes:    Number(prices.mes),
    }
    await savePrices(normalized)
    setPrices(normalized)
    setSaving(false)
    setSaved(true)
  }

  if (loading) return <p style={{ color: 'var(--text-3)' }}>Cargando...</p>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configuración</h1>
      <p className={styles.sub}>Ajusta los precios base de cada tipo de membresía.</p>

      <div className={styles.list}>
        {PLANS.map(plan => (
          <div key={plan.key} className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowLabel}>{plan.label}</span>
              <span className={styles.rowDesc}>{plan.desc}</span>
            </div>

            <div className={styles.amountControl}>
              <button
                type="button"
                className={styles.amountBtn}
                onClick={() => adjust(plan.key, -10)}
              >
                −
              </button>
              <div className={styles.amountDisplay}>
                <span className={styles.amountPrefix}>$</span>
                <input
                  type="number"
                  min="0"
                  value={prices[plan.key]}
                  onChange={e => handleChange(plan.key, e.target.value)}
                  className={styles.amountField}
                />
              </div>
              <button
                type="button"
                className={styles.amountBtn}
                onClick={() => adjust(plan.key, 10)}
              >
                ＋
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>

      <p className={styles.note}>
        Los cambios aplican a partir de ahora. Los miembros ya registrados conservan
        el precio que pagaron en sus registros anteriores.
      </p>
    </div>
  )
}