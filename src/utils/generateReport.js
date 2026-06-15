import { jsPDF } from 'jspdf'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Colores de la paleta del sistema
const C = {
  black:   [15,  15,  15],
  surface: [26,  26,  26],
  card:    [34,  34,  34],
  border:  [46,  46,  46],
  green:   [34,  197, 94],
  amber:   [245, 158, 11],
  blue:    [59,  130, 246],
  text:    [240, 240, 240],
  text2:   [154, 154, 154],
  text3:   [96,  96,  96],
}

// Formatea número como moneda MXN
function money(n) {
  return `$${Number(n).toLocaleString('es-MX')}`
}

export function generateWeeklyReport({ interval, periodLabel, total, byPlan, byMember, periodPayments }) {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W    = 210   // ancho A4 en mm
  const PAD  = 16    // margen lateral
  let   y    = 0     // cursor vertical

  // ── Helpers de dibujo ────────────────────────────────────────────

  function fillPage(color) {
    doc.setFillColor(...color)
    doc.rect(0, 0, W, 297, 'F')
  }

  function rect(x, rx, ry, rw, rh, color, radius = 3) {
    doc.setFillColor(...color)
    doc.roundedRect(rx, ry, rw, rh, radius, radius, 'F')
  }

  function text(content, tx, ty, color, size = 10, style = 'normal') {
    doc.setTextColor(...color)
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.text(String(content), tx, ty)
  }

  function line(lx1, ly1, lx2, ly2, color = C.border) {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.2)
    doc.line(lx1, ly1, lx2, ly2)
  }

  // ── Página 1 ──────────────────────────────────────────────────────

  fillPage(C.black)

  // Encabezado con banda verde
  doc.setFillColor(...C.green)
  doc.rect(0, 0, W, 38, 'F')

  text('GymControl', PAD, 13, C.black, 18, 'bold')
  text('Sistema de membresías', PAD, 20, [10, 80, 35], 9)

  const now = format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })
  text(`Generado: ${now}`, W - PAD, 13, C.black, 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.black)
  // Alinea a la derecha
  const genW = doc.getTextWidth(`Generado: ${now}`)
  doc.text(`Generado: ${now}`, W - PAD - genW, 13)

  // Título del reporte
  text('Reporte de ingresos', PAD, 32, C.black, 11, 'bold')
  text(periodLabel, W - PAD - doc.getTextWidth(periodLabel) * 0.95, 32, C.black, 10)

  y = 48

  // ── Tarjeta de total ──────────────────────────────────────────────
  rect(null, PAD, y, W - PAD * 2, 28, C.surface)
  text('TOTAL COBRADO', PAD + 6, y + 8, C.text3, 7, 'bold')
  text(money(total), PAD + 6, y + 20, C.green, 20, 'bold')
  text(
    `${periodPayments.length} ${periodPayments.length === 1 ? 'pago' : 'pagos'} · ${byMember.length} ${byMember.length === 1 ? 'miembro' : 'miembros'}`,
    PAD + 6, y + 26, C.text2, 8
  )
  y += 34

  // ── Desglose por plan (3 tarjetas en fila) ────────────────────────
  const planNames  = { dia: 'Día', semana: 'Semana', mes: 'Mes' }
  const planColors = { dia: C.amber, semana: C.blue, mes: C.green }
  const cardW      = (W - PAD * 2 - 8) / 3
  const plans      = ['dia', 'semana', 'mes']

  plans.forEach((plan, i) => {
    const cx = PAD + i * (cardW + 4)
    rect(null, cx, y, cardW, 24, C.surface)

    // Franja de color superior
    doc.setFillColor(...planColors[plan])
    doc.roundedRect(cx, y, cardW, 3, 1, 1, 'F')

    text(planNames[plan].toUpperCase(), cx + 4, y + 9,  C.text3, 7, 'bold')
    text(money(byPlan[plan].amount),   cx + 4, y + 17, planColors[plan], 11, 'bold')
    text(
      `${byPlan[plan].count} ${byPlan[plan].count === 1 ? 'pago' : 'pagos'}`,
      cx + 4, y + 22, C.text3, 7
    )
  })

  y += 32

  // ── Tabla de pagos por miembro ────────────────────────────────────
  text('Detalle por miembro', PAD, y, C.text, 10, 'bold')
  y += 6

  // Cabecera de tabla
  doc.setFillColor(...C.surface)
  doc.rect(PAD, y, W - PAD * 2, 7, 'F')
  text('Miembro',  PAD + 4,          y + 5, C.text2, 8, 'bold')
  text('Pagos',    PAD + 90,         y + 5, C.text2, 8, 'bold')
  text('Plan(es)', PAD + 110,        y + 5, C.text2, 8, 'bold')
  text('Total',    W - PAD - 4,      y + 5, C.text2, 8, 'bold')
  // Alinear "Total" a la derecha
  const totalHeaderW = doc.getTextWidth('Total')
  doc.text('Total', W - PAD - totalHeaderW, y + 5)
  y += 9

  // Filas de miembros
  byMember.forEach((m, idx) => {
    // Nueva página si no hay espacio suficiente
    if (y > 265) {
      doc.addPage()
      fillPage(C.black)
      y = 16
    }

    // Fila alternada para legibilidad
    if (idx % 2 === 0) {
      doc.setFillColor(...C.surface)
      doc.rect(PAD, y - 1, W - PAD * 2, 8, 'F')
    }

    // Iniciales en círculo de color
    const initials = m.memberName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    doc.setFillColor(...C.card)
    doc.circle(PAD + 6, y + 3, 3.5, 'F')
    text(initials, PAD + 6, y + 4.5, C.green, 6, 'bold')
    doc.text(initials, PAD + 6 - doc.getTextWidth(initials) / 2, y + 4.5)

    // Nombre
    text(m.memberName,  PAD + 12, y + 5, C.text,  9)

    // Cantidad de pagos
    text(
      `${m.payments.length}`,
      PAD + 92, y + 5, C.text2, 9
    )

    // Planes únicos usados en el período
    const uniquePlans = [...new Set(m.payments.map(p => planNames[p.plan]))].join(', ')
    text(uniquePlans, PAD + 110, y + 5, C.text2, 8)

    // Total alineado a la derecha
    const totalStr = money(m.total)
    const totalW   = doc.getTextWidth(totalStr)
    doc.setTextColor(...C.green)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(totalStr, W - PAD - totalW, y + 5)

    line(PAD, y + 7, W - PAD, y + 7)
    y += 9

    // Sub-filas: pagos individuales de este miembro (indentados)
    m.payments.forEach(p => {
      if (y > 265) {
        doc.addPage()
        fillPage(C.black)
        y = 16
      }

      const dateStr = format(parseISO(p.date), "d MMM, HH:mm", { locale: es })
      text('·', PAD + 14, y + 4, C.text3, 8)
      text(p.planLabel, PAD + 18, y + 4, C.text2, 8)
      text(dateStr,     PAD + 40, y + 4, C.text3, 7)

      const amtStr = money(p.amount ?? 0)
      doc.setTextColor(...C.text2)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(amtStr, W - PAD - doc.getTextWidth(amtStr), y + 4)

      y += 6
    })

    y += 2  // espacio entre miembros
  })

  // ── Pie de página en cada página ─────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.2)
    doc.line(PAD, 285, W - PAD, 285)
    doc.setTextColor(...C.text3)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('GymControl — Reporte confidencial', PAD, 290)
    doc.text(`Página ${i} de ${pageCount}`, W - PAD - doc.getTextWidth(`Página ${i} de ${pageCount}`), 290)
  }

  // Nombre del archivo: reporte-semana-2026-06-10.pdf
  const fileName = `reporte-${format(new Date(), 'yyyy-MM-dd')}.pdf`
  doc.save(fileName)
}