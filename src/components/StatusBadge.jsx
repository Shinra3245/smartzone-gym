// StatusBadge — muestra verde/rojo/amarillo según estado de membresía
import styles from './StatusBadge.module.css'

const CONFIG = {
  active:   { label: '✓ Activo',      cls: 'active'   },
  expiring: { label: '⚠ Por vencer',  cls: 'expiring' },
  expired:  { label: '✕ Vencido',     cls: 'expired'  },
}

export default function StatusBadge({ status, size = 'md' }) {
  const { label, cls } = CONFIG[status] ?? CONFIG.expired
  return (
    <span className={`${styles.badge} ${styles[cls]} ${styles[size]}`}>
      {label}
    </span>
  )
}
