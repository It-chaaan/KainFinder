import { useEffect, useRef, useState } from 'react'
import './index.css'

type Point = { lat: number; lng: number }
type Place = { id: string; displayName?: string; formattedAddress?: string; location?: { lat: () => number; lng: () => number } }
type MapInstance = { setCenter: (point: Point) => void; setZoom: (zoom: number) => void; addListener: (event: string, handler: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => { remove: () => void } }
type Marker = { setMap: (map: MapInstance | null) => void; setIcon: (icon: Record<string, unknown> | undefined) => void; setLabel: (label: string | { text: string; color: string }) => void; addListener: (event: string, handler: () => void) => void }
type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance
  Marker: new (options: Record<string, unknown>) => Marker
  SymbolPath: { CIRCLE: number }
  importLibrary: (name: string) => Promise<unknown>
  places: { Place: { searchByText: (request: Record<string, unknown>) => Promise<{ places: Place[] }> } }
}

const MANILA: Point = { lat: 14.5995, lng: 120.9842 }
const CITIES: { name: string; point: Point }[] = [
  { name: 'Manila', point: MANILA },
  { name: 'Quezon City', point: { lat: 14.676, lng: 121.0437 } },
  { name: 'Makati', point: { lat: 14.5547, lng: 121.0244 } },
  { name: 'Pasig', point: { lat: 14.5764, lng: 121.0851 } },
  { name: 'Taguig', point: { lat: 14.5176, lng: 121.0509 } },
  { name: 'Mandaluyong', point: { lat: 14.5794, lng: 121.0359 } },
  { name: 'Pasay', point: { lat: 14.5378, lng: 121.0014 } },
]

const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
let mapsPromise: Promise<MapsApi> | undefined

function loadMaps(): Promise<MapsApi> {
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise((resolve, reject) => {
    const callback = '__craveItMapsReady'
    const browser = window as Window & { google?: { maps: MapsApi }; __craveItMapsReady?: () => void }
    browser[callback] = () => {
      delete browser[callback]
      if (browser.google?.maps) resolve(browser.google.maps)
      else reject(new Error('Google Maps did not initialize.'))
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key ?? '')}&v=weekly&loading=async&callback=${callback}`
    script.async = true
    script.onerror = () => {
      delete browser[callback]
      reject(new Error('Google Maps could not load. Check your connection and key settings.'))
    }
    document.head.appendChild(script)
  })
  return mapsPromise
}

function App() {
  const mapElement = useRef<HTMLDivElement>(null)
  const map = useRef<MapInstance | null>(null)
  const maps = useRef<MapsApi | null>(null)
  const markers = useRef<Marker[]>([])
  const pointMarker = useRef<Marker | null>(null)
  const requestId = useRef(0)
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const [query, setQuery] = useState('')
  const [point, setPoint] = useState<Point>(MANILA)
  const [pointName, setPointName] = useState('Manila')
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error' | 'missing-key'>(key ? 'loading' : 'missing-key')
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'results' | 'empty' | 'error'>('idle')
  const [error, setError] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function updatePoint(next: Point, name: string, message: string) {
    requestId.current += 1
    setPoint(next)
    setPointName(name)
    setLocationMessage(message)
    setResults([])
    setSelectedId(null)
    setSearchState('idle')
  }

  useEffect(() => {
    if (!key || !mapElement.current) return
    let active = true
    let clickListener: { remove: () => void } | undefined
    loadMaps().then((api) => {
      if (!active || !mapElement.current) return
      maps.current = api
      map.current = new api.Map(mapElement.current, {
        center: MANILA, zoom: 12, mapTypeControl: false, streetViewControl: false,
        fullscreenControl: true, zoomControl: true,
      })
      clickListener = map.current.addListener('click', (event) => {
        if (!event.latLng) return
        const chosen = { lat: event.latLng.lat(), lng: event.latLng.lng() }
        updatePoint(chosen, 'Pinned point', 'Search point moved on the map. Submit again to search here.')
      })
      setMapState('ready')
    }).catch((reason: unknown) => {
      if (active) {
        setError(reason instanceof Error ? reason.message : 'Google Maps could not load.')
        setMapState('error')
      }
    })
    return () => {
      active = false
      clickListener?.remove()
      markers.current.forEach((marker) => marker.setMap(null))
      pointMarker.current?.setMap(null)
    }
  }, [])

  useEffect(() => {
    if (!maps.current || !map.current) return
    const styles = getComputedStyle(document.documentElement)
    pointMarker.current?.setMap(null)
    pointMarker.current = new maps.current.Marker({
      map: map.current, position: point, title: `Search point: ${pointName}`,
      icon: {
        path: maps.current.SymbolPath.CIRCLE, scale: 9,
        fillColor: styles.getPropertyValue('--color-map-point').trim(), fillOpacity: 1,
        strokeColor: styles.getPropertyValue('--color-map-point-ring').trim(), strokeWeight: 3,
      },
      zIndex: 100,
    })
    map.current.setCenter(point)
    map.current.setZoom(14)
  }, [point, pointName, mapState])

  useEffect(() => {
    markers.current.forEach((marker) => marker.setMap(null))
    markers.current = []
    if (!maps.current || !map.current) return
    results.forEach((place, index) => {
      if (!place.location) return
      const marker = new maps.current!.Marker({
        map: map.current, position: place.location,
        title: `${index + 1}. ${place.displayName ?? 'Restaurant'}`,
        label: String(index + 1),
      })
      marker.addListener('click', () => selectPlace(place))
      markers.current.push(marker)
    })
    return () => markers.current.forEach((marker) => marker.setMap(null))
  }, [results])

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    markers.current.forEach((marker, index) => {
      const selected = results[index]?.id === selectedId
      marker.setIcon(selected && maps.current ? {
        path: maps.current.SymbolPath.CIRCLE, scale: 15,
        fillColor: styles.getPropertyValue('--color-map-pin-selected').trim(), fillOpacity: 1,
        strokeColor: styles.getPropertyValue('--color-map-pin-ring').trim(), strokeWeight: 2,
      } : undefined)
      marker.setLabel(selected
        ? { text: String(index + 1), color: styles.getPropertyValue('--color-map-pin-label').trim() }
        : String(index + 1))
    })
  }, [selectedId, results])

  function selectPlace(place: Place) {
    setSelectedId(place.id)
    cardRefs.current[place.id]?.scrollIntoView({
      block: 'nearest',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
    if (place.location && map.current) map.current.setCenter({ lat: place.location.lat(), lng: place.location.lng() })
  }

  function chooseCity(name: string) {
    const city = CITIES.find((item) => item.name === name)
    if (!city) return
    updatePoint(city.point, city.name, `Search point set to ${city.name}. Submit again to search here.`)
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Location is unavailable in this browser. Choose a city or tap the map.')
      return
    }
    setLocationMessage('Requesting your location…')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      updatePoint({ lat: coords.latitude, lng: coords.longitude }, 'Your location', 'Search point set to your location. Submit to search here.')
    }, (locationError) => {
      setLocationMessage(locationError.code === 1
        ? 'Location access was denied. Choose a city or tap the map instead.'
        : 'Could not get your location. Choose a city or tap the map instead.')
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
  }

  async function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const textQuery = query.trim()
    if (!textQuery || !maps.current) return
    const currentRequest = ++requestId.current
    setSearchState('loading')
    setError('')
    setResults([])
    setSelectedId(null)
    try {
      await maps.current.importLibrary('places')
      const { places } = await maps.current.places.Place.searchByText({
        textQuery, fields: ['id', 'displayName', 'formattedAddress', 'location'],
        locationBias: { center: point, radius: 6000 }, maxResultCount: 8,
      })
      if (currentRequest !== requestId.current) return
      const located = places.filter((place) => place.location)
      setResults(located)
      setSearchState(located.length ? 'results' : 'empty')
    } catch (reason) {
      if (currentRequest !== requestId.current) return
      setError(reason instanceof Error ? reason.message : 'The search could not be completed.')
      setSearchState('error')
    }
  }

  return (
    <main className="app-shell">
      <header className="site-header"><span className="wordmark">Crave It</span><span className="header-note">A kainan finder app</span></header>
      <div className="workspace">
        <section className="control-panel" aria-label="Find restaurants">
          <div className="intro"><p className="eyebrow">METRO MANILA FOOD SEARCH</p><h1>Where to eat?</h1><p>Pick a search point, then look for a dish or restaurant.</p></div>
          <form onSubmit={submitSearch} className="search-form">
            <label className="ui-label" htmlFor="food-query">Food or restaurant</label>
            <div className="search-row"><input className="ui-field" id="food-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. ramen, sisig, café" required /><button className="ui-button ui-button--primary" type="submit" disabled={mapState !== 'ready' || searchState === 'loading'}>{searchState === 'loading' ? 'Searching…' : 'Search'}</button></div>
          </form>
          <div className="location-controls"><div><span className="ui-label">Search point</span><strong>{pointName}</strong><span className="point-hint">Nearby results are approximate.</span></div><button type="button" className="ui-button ui-button--outline" onClick={requestLocation}>Use my location</button></div>
          <label className="ui-label" htmlFor="city">Or choose a city</label>
          <select className="ui-field" id="city" value={CITIES.some((city) => city.name === pointName) ? pointName : ''} onChange={(event) => chooseCity(event.target.value)}><option value="" disabled>Choose a city</option>{CITIES.map((city) => <option key={city.name}>{city.name}</option>)}</select>
          <p className="helper">You can also tap the map to place the search point.</p>
          <p className="location-message" role="status">{locationMessage}</p>
        </section>
        <section className="map-panel" aria-label="Google map and search results">
          <div className="map-wrap">
            <div ref={mapElement} className="map" aria-label="Google Map of Metro Manila" />
            {mapState !== 'ready' && <div className="map-overlay" role="status">{mapState === 'missing-key' ? 'Add a Google Maps browser key to show the map.' : mapState === 'loading' ? 'Loading Google Map…' : error}</div>}
          </div>
          <div className="results-panel" aria-live="polite">
            <div className="results-heading"><h2>Places</h2><span>{searchState === 'results' ? `${results.length} results` : 'Around your point'}</span></div>
            {searchState === 'idle' && <p className="state-copy">Enter a food or restaurant and press Search. Results will appear here and on the map.</p>}
            {searchState === 'loading' && <p className="state-copy" role="status">Finding places near {pointName}…</p>}
            {searchState === 'empty' && <p className="state-copy">No places found near {pointName}. Try another search or point.</p>}
            {searchState === 'error' && <div className="state-copy"><p>Search is unavailable right now. Check your connection or Google API settings, then try again.</p><p className="error-detail">{error}</p></div>}
            {searchState === 'results' && <ol className="result-list">{results.map((place, index) => <li key={place.id} ref={(element) => { cardRefs.current[place.id] = element }} className={selectedId === place.id ? 'result-card selected' : 'result-card'}><button type="button" onClick={() => selectPlace(place)} aria-pressed={selectedId === place.id}><span className="result-index">{index + 1}</span><span><strong>{place.displayName ?? 'Restaurant'}</strong><small>{place.formattedAddress ?? 'Address unavailable'}</small></span></button><a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${place.location?.lat()},${place.location?.lng()}&destination_place_id=${encodeURIComponent(place.id)}`}>Directions <span aria-hidden="true">↗</span></a></li>)}</ol>}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
