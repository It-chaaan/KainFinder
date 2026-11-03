export type Point = { lat: number; lng: number }

export type Place = {
  id: string
  displayName?: string
  formattedAddress?: string
  location?: { lat: () => number; lng: () => number }
}

export type MapInstance = {
  setCenter: (point: Point) => void
  setZoom: (zoom: number) => void
  addListener: (
    event: string,
    handler: (event: { latLng?: { lat: () => number; lng: () => number } }) => void,
  ) => { remove: () => void }
}

export type Marker = {
  setMap: (map: MapInstance | null) => void
  setIcon: (icon: Record<string, unknown> | undefined) => void
  setLabel: (label: string | { text: string; color: string }) => void
  addListener: (event: string, handler: () => void) => void
}

export type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance
  Marker: new (options: Record<string, unknown>) => Marker
  SymbolPath: { CIRCLE: number }
  importLibrary: (name: string) => Promise<unknown>
  places: { Place: { searchByText: (request: Record<string, unknown>) => Promise<{ places: Place[] }> } }
}

export const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()

let mapsPromise: Promise<MapsApi> | undefined

export function loadMaps(): Promise<MapsApi> {
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise((resolve, reject) => {
    const callback = '__craveItMapsReady'
    const browser = window as Window & {
      google?: { maps: MapsApi }
      __craveItMapsReady?: () => void
      gm_authFailure?: () => void
    }
    const timeout = window.setTimeout(() => {
      reject(new Error('Google Maps took too long to load.'))
    }, 20000)

    browser[callback] = () => {
      window.clearTimeout(timeout)
      delete browser[callback]
      if (browser.google?.maps) resolve(browser.google.maps)
      else reject(new Error('Google Maps did not initialize.'))
    }
    browser.gm_authFailure = () => {
      window.clearTimeout(timeout)
      reject(new Error('Google Maps could not authorize this browser key.'))
      window.dispatchEvent(new Event('craveit:maps-auth-failure'))
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsKey ?? '')}&v=weekly&loading=async&callback=${callback}`
    script.async = true
    script.onerror = () => {
      window.clearTimeout(timeout)
      delete browser[callback]
      reject(new Error('Google Maps could not load. Check your connection and key settings.'))
    }
    document.head.appendChild(script)
  })

  return mapsPromise
}
