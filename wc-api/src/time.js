// Parse openfootball "HH:MM UTC-X" + ISO date → epoch SECONDS (UTC).
export function kickoffEpoch(date, time) {
  const m = /^(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})$/.exec(time.trim())
  if (!m) throw new Error('bad time: ' + time)
  const [_, hh, mm, off] = m
  const [Y, Mo, D] = date.split('-').map(Number)
  return Date.UTC(Y, Mo - 1, D, Number(hh) - Number(off), Number(mm), 0) / 1000
}
