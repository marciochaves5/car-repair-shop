// Mirrors Car_Repair_Shop.Models.WorkOrderStatus.
// The API serializes the enum as an integer by default, but we tolerate strings too.

export const STATUS = [
  { value: 0, key: 'Open', label: 'Aberta', pill: 'pill-open', short: 'Aberta' },
  { value: 1, key: 'InProgress', label: 'Em andamento', pill: 'pill-progress', short: 'Andamento' },
  { value: 2, key: 'Finished', label: 'Finalizada', pill: 'pill-finished', short: 'Finalizada' },
  { value: 3, key: 'Delivered', label: 'Entregue', pill: 'pill-delivered', short: 'Entregue' },
]

export function normalizeStatus(raw) {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    const asNum = Number(raw)
    if (!Number.isNaN(asNum) && raw.trim() !== '') return asNum
    const found = STATUS.find((s) => s.key.toLowerCase() === raw.toLowerCase())
    return found ? found.value : 0
  }
  return 0
}

export function statusMeta(raw) {
  const v = normalizeStatus(raw)
  return STATUS.find((s) => s.value === v) || STATUS[0]
}
