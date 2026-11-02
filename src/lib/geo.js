const R = 6371

export function distanceKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Projection locale équirectangulaire en km autour d'une origine */
export function projector(origin) {
  const kx = 111.32 * Math.cos((origin.latitude * Math.PI) / 180)
  const ky = 110.57
  return ([lon, lat]) => [(lon - origin.longitude) * kx, -(lat - origin.latitude) * ky]
}

export function dms(value, pos, neg) {
  const d = Math.floor(Math.abs(value))
  const m = Math.round((Math.abs(value) - d) * 60)
  return `${d}°${String(m).padStart(2, '0')}′${value >= 0 ? pos : neg}`
}
