// MemberCard — tarjeta compacta usada en la lista de miembros
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from './StatusBadge'
import { memberStatus } from '../data/store'
import styles from './MemberCard.module.css'

export default function MemberCard({ member, onClick }) {
  const status  = memberStatus(member)
  const expiry  = format(parseISO(member.expiry), "d MMM yyyy", { locale: es })

  return (
    <button className={styles.card} onClick={() => onClick(member)}>
      {/* Avatar con iniciales */}
      <div className={`${styles.avatar} ${styles[status]}`}>
        {member.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{member.name}</p>
        <p className={styles.meta}>
          {member.planLabel} · vence {expiry}
        </p>
      </div>

      <StatusBadge status={status} />
    </button>
  )
}
