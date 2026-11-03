import type { Point } from './googleMaps'

export const MANILA: Point = { lat: 14.5995, lng: 120.9842 }

export const CITIES: { name: string; point: Point }[] = [
  { name: 'Manila', point: MANILA },
  { name: 'Quezon City', point: { lat: 14.676, lng: 121.0437 } },
  { name: 'Makati', point: { lat: 14.5547, lng: 121.0244 } },
  { name: 'Pasig', point: { lat: 14.5764, lng: 121.0851 } },
  { name: 'Taguig', point: { lat: 14.5176, lng: 121.0509 } },
  { name: 'Mandaluyong', point: { lat: 14.5794, lng: 121.0359 } },
  { name: 'Pasay', point: { lat: 14.5378, lng: 121.0014 } },
]
