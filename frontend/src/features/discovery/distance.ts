import type { Point } from './googleMaps'

const EARTH_RADIUS_KM = 6371.0088

export function straightLineDistanceKm(center: Point, destination?: Point | null): number | null {
  if (!destination) return null
  const coordinates = [center.lat, center.lng, destination.lat, destination.lng]
  if (coordinates.some((value) => !Number.isFinite(value))) return null
  if (Math.abs(center.lat) > 90 || Math.abs(destination.lat) > 90 ||
    Math.abs(center.lng) > 180 || Math.abs(destination.lng) > 180) return null

  const toRadians = (degrees: number) => degrees * Math.PI / 180
  const latDelta = toRadians(destination.lat - center.lat)
  const lngDelta = toRadians(destination.lng - center.lng)
  const a = Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(center.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(lngDelta / 2) ** 2
  const boundedA = Math.min(1, Math.max(0, a))
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(boundedA), Math.sqrt(1 - boundedA))
}

export function formatStraightLineDistance(km: number | null): string {
  if (km === null) return 'Straight-line distance unavailable'
  if (km < 0.1) return 'Under 0.1 km straight-line distance'
  return `${km.toFixed(1)} km straight-line distance`
}
