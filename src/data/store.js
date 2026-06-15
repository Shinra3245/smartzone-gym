import { v4 as uuid } from 'uuid'
import { addDays, addMonths, addWeeks, isAfter, parseISO } from 'date-fns'
import { db } from '../firebase/config'
import {
  collection, doc,
  getDocs, getDoc, setDoc, updateDoc, deleteDoc,
} from 'firebase/firestore'

const MEMBERS_COL = 'members'
const PRICES_DOC  = 'config/prices'

const PLAN_LABELS = {
  dia:    'Día',
  semana: 'Semana',
  mes:    'Mes',
}

const DEFAULT_PRICES = { dia: 50, semana: 150, mes: 400 }

// ── Precios ──────────────────────────────────────────────────────

export async function getPrices() {
  try {
    const snap = await getDoc(doc(db, PRICES_DOC))
    return snap.exists() ? snap.data() : DEFAULT_PRICES
  } catch {
    return DEFAULT_PRICES
  }
}

export async function savePrices(prices) {
  await setDoc(doc(db, PRICES_DOC), prices)
}

// ── Helpers de fecha ─────────────────────────────────────────────

function calcExpiry(startDate, plan) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  if (plan === 'dia')    return addDays(start, 1)
  if (plan === 'semana') return addWeeks(start, 1)
  if (plan === 'mes')    return addMonths(start, 1)
  return addDays(start, 1)
}

// ── Miembros ─────────────────────────────────────────────────────

export async function getMembers() {
  const snap = await getDocs(collection(db, MEMBERS_COL))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addMember({ name, phone, plan, amount }) {
  const prices    = await getPrices()
  const startDate = new Date().toISOString()
  const expiry    = calcExpiry(new Date(), plan).toISOString()
  const finalAmount = amount != null ? Number(amount) : prices[plan]

  const id = uuid()
  const member = {
    name: name.trim(), phone: phone?.trim() || '',
    plan, planLabel: PLAN_LABELS[plan], startDate, expiry,
    createdAt: startDate,
    payments: [{ id: uuid(), date: startDate, plan, planLabel: PLAN_LABELS[plan], amount: finalAmount }],
  }

  await setDoc(doc(db, MEMBERS_COL, id), member)
  return { id, ...member }
}

export async function renewMember(id, plan, amount) {
  const prices  = await getPrices()
  const refDoc  = doc(db, MEMBERS_COL, id)
  const snap    = await getDoc(refDoc)
  if (!snap.exists()) return null

  const current     = snap.data()
  const startDate   = new Date().toISOString()
  const finalAmount = amount != null ? Number(amount) : prices[plan]
  const prevPayments = current.payments ?? []

  const updated = {
    plan, planLabel: PLAN_LABELS[plan],
    startDate,
    expiry: calcExpiry(new Date(), plan).toISOString(),
    payments: [...prevPayments, { id: uuid(), date: startDate, plan, planLabel: PLAN_LABELS[plan], amount: finalAmount }],
  }

  await updateDoc(refDoc, updated)
  return { id, ...current, ...updated }
}

export async function deleteMember(id) {
  await deleteDoc(doc(db, MEMBERS_COL, id))
}

// ── Estado de membresía (sin cambios — es lógica pura, no I/O) ──

export function memberStatus(member) {
  const now    = new Date()
  const expiry = parseISO(member.expiry)
  if (!isAfter(expiry, now)) return 'expired'
  if (!isAfter(expiry, addDays(now, 3))) return 'expiring'
  return 'active'
}

// ── Pagos agregados ──────────────────────────────────────────────

export async function getAllPayments() {
  const members = await getMembers()
  const all = []
  members.forEach(m => {
    (m.payments ?? []).forEach(p => {
      all.push({ ...p, memberName: m.name, memberId: m.id })
    })
  })
  return all.sort((a, b) => new Date(b.date) - new Date(a.date))
}