import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMembers, memberStatus } from '../data/store'
import { normalize } from '../utils/text'
import MemberCard from '../components/MemberCard'
import MemberModal from '../components/MemberModal'
import styles from './Members.module.css'

const FILTERS = [
  { value: 'all',      label: 'Todos'      },
  { value: 'active',   label: 'Activos'    },
  { value: 'expiring', label: 'Por vencer' },
  { value: 'expired',  label: 'Vencidos'   },
]

export default function Members() {
  const [searchParams] = useSearchParams()
  const urlFilter = searchParams.get('filter')

  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState(urlFilter ?? 'all')
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    const data = await getMembers()
    setMembers(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])
  useEffect(() => { if (urlFilter) setFilter(urlFilter) }, [urlFilter])

  if (loading) return <p style={{ color: 'var(--text-3)' }}>Cargando...</p>

  const expiring = members.filter(m => memberStatus(m) === 'expiring')

  const filtered = members.filter(m => {
    const status      = memberStatus(m)
    const matchFilter = filter === 'all' || status === filter
    const matchQuery  = normalize(m.name).includes(normalize(query))
    return matchFilter && matchQuery
  })

  const counts = {
    all:      members.length,
    active:   members.filter(m => memberStatus(m) === 'active').length,
    expiring: expiring.length,
    expired:  members.filter(m => memberStatus(m) === 'expired').length,
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h1 className={styles.title}>Miembros</h1>
        <span className={styles.count}>{members.length} registrados</span>
      </div>

      {expiring.length > 0 && filter !== 'expiring' && (
        <div className={styles.alertBanner}>
          <div className={styles.alertLeft}>
            <span className={styles.alertIcon}>⚠</span>
            <div>
              <p className={styles.alertTitle}>
                {expiring.length === 1
                  ? '1 miembro vence en los próximos 3 días'
                  : `${expiring.length} miembros vencen en los próximos 3 días`}
              </p>
              <p className={styles.alertNames}>
                {expiring.map(m => m.name.split(' ')[0]).join(', ')}
              </p>
            </div>
          </div>
          <button className={styles.alertBtn} onClick={() => setFilter('expiring')}>Ver →</button>
        </div>
      )}

      <input
        type="text"
        className={styles.search}
        placeholder="Buscar por nombre..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span className={styles.filterCount}>{counts[f.value]}</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map(m => (
            <MemberCard key={m.id} member={m} onClick={setSelected} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}><p>No hay miembros que coincidan con ese filtro.</p></div>
      )}

      {selected && (
        <MemberModal
          member={selected}
          onClose={() => setSelected(null)}
          onUpdate={loadMembers}
        />
      )}
    </div>
  )
}