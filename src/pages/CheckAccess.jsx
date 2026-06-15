import { useState } from 'react'
import { getMembers, memberStatus } from '../data/store'
import { normalize } from '../utils/text'
import StatusBadge from '../components/StatusBadge'
import MemberModal from '../components/MemberModal'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './CheckAccess.module.css'

export default function CheckAccess() {
  const [query,   setQuery]   = useState('')
  const [result,  setResult]  = useState(null)
  const [modal,   setModal]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    const q = normalize(query)
    const members = await getMembers()
    const found = members.find(m => normalize(m.name).includes(q))
    setResult(found ?? 'not_found')
    setLoading(false)
  }

  function handleKeyUp(e) {
    if (e.target.value === '') setResult(null)
  }

  // Tras renovar/eliminar desde el modal, vuelve a buscar para refrescar el resultado
  async function handleUpdate() {
    if (!result || result === 'not_found') return
    const members = await getMembers()
    const updated = members.find(m => m.id === result.id)
    setResult(updated ?? 'not_found')
  }

  const status = result && result !== 'not_found' ? memberStatus(result) : null
  const expiry = result && result !== 'not_found'
    ? format(parseISO(result.expiry), "d 'de' MMMM yyyy", { locale: es })
    : null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Verificar acceso</h1>
      <p className={styles.sub}>Busca al miembro por nombre para saber si puede entrar hoy.</p>

      <form className={styles.form} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.input}
          placeholder="Escribe el nombre del miembro..."
          value={query}
          onChange={e => { setQuery(e.target.value); setResult(null) }}
          onKeyUp={handleKeyUp}
          autoFocus
        />
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {result && result !== 'not_found' && (
        <div className={`${styles.resultCard} ${styles[status]}`}>
          <div className={`${styles.bigIcon} ${styles[`icon_${status}`]}`}>
            {status === 'active'   && '✓'}
            {status === 'expiring' && '!'}
            {status === 'expired'  && '✕'}
          </div>

          <div className={styles.resultBody}>
            <h2 className={styles.memberName}>{result.name}</h2>
            <StatusBadge status={status} size="lg" />
            <p className={styles.expiryText}>
              {status === 'expired'
                ? `Membresía vencida el ${expiry}`
                : `Membresía válida hasta el ${expiry}`}
            </p>
            <p className={styles.planText}>Plan: {result.planLabel}</p>
          </div>

          <button className={styles.detailBtn} onClick={() => setModal(true)}>
            Ver detalle / Renovar
          </button>
        </div>
      )}

      {result === 'not_found' && (
        <div className={styles.notFound}>
          <p className={styles.notFoundIcon}>🔍</p>
          <p className={styles.notFoundText}>No se encontró ningún miembro con ese nombre.</p>
          <p className={styles.notFoundSub}>¿Es la primera vez que viene? <a href="/new">Regístralo aquí.</a></p>
        </div>
      )}

      {modal && result && result !== 'not_found' && (
        <MemberModal
          member={result}
          onClose={() => { setModal(false); setResult(null); setQuery('') }}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}