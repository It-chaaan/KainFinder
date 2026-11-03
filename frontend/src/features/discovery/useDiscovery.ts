import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CITIES, MANILA } from './locations'
import { mapsKey } from './googleMaps'
import type { MapsApi, Place, Point } from './googleMaps'

export type MapState = 'loading' | 'ready' | 'error' | 'missing-key'
export type SearchState = 'idle' | 'loading' | 'results' | 'empty' | 'error'
export type SearchErrorKind = 'network' | 'limit' | 'api'

function classifySearchError(reason: unknown): SearchErrorKind {
  const message = reason instanceof Error ? `${reason.name} ${reason.message}` : String(reason)
  if (/quota|limit|RESOURCE_EXHAUSTED|OVER_QUERY_LIMIT|429/i.test(message)) return 'limit'
  if (!navigator.onLine || /network|fetch|connection|timeout|unavailable/i.test(message)) return 'network'
  return 'api'
}

export function useDiscovery() {
  const requestId = useRef(0)
  const locationRequestId = useRef(0)
  const [mapsApi, setMapsApi] = useState<MapsApi | null>(null)
  const [mapState, setMapState] = useState<MapState>(mapsKey ? 'loading' : 'missing-key')
  const [mapError, setMapError] = useState('')
  const [query, setQuery] = useState('')
  const [point, setPoint] = useState<Point>(MANILA)
  const [pointName, setPointName] = useState('Manila')
  const [locationMessage, setLocationMessage] = useState('')
  const [searchState, setSearchState] = useState<SearchState>('idle')
  const [searchErrorKind, setSearchErrorKind] = useState<SearchErrorKind>('api')
  const [results, setResults] = useState<Place[]>([])
  const [searchedQuery, setSearchedQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function updatePoint(next: Point, name: string, message: string) {
    requestId.current += 1
    locationRequestId.current += 1
    setPoint(next)
    setPointName(name)
    setLocationMessage(message)
    setResults([])
    setSelectedId(null)
    setSearchState('idle')
  }

  function chooseCity(name: string) {
    const city = CITIES.find((item) => item.name === name)
    if (!city) return
    updatePoint(city.point, city.name, `Search center set to ${city.name}. Submit again to search here.`)
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Location is unavailable in this browser. Choose a city or tap the map.')
      return
    }
    const currentLocationRequest = ++locationRequestId.current
    setLocationMessage('Requesting your location…')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (currentLocationRequest !== locationRequestId.current) return
      updatePoint(
        { lat: coords.latitude, lng: coords.longitude },
        'Your location',
        'Search center set to your location. Submit to search here.',
      )
    }, (locationError) => {
      if (currentLocationRequest !== locationRequestId.current) return
      setLocationMessage(locationError.code === 1
        ? 'Location access was denied. Choose a city or tap the map instead.'
        : 'Could not get your location. Choose a city or tap the map instead.')
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const textQuery = query.trim()
    if (!textQuery || !mapsApi) return

    const currentRequest = ++requestId.current
    setSearchedQuery(textQuery)
    setSearchState('loading')
    setResults([])
    setSelectedId(null)
    try {
      await mapsApi.importLibrary('places')
      const { places } = await mapsApi.places.Place.searchByText({
        textQuery,
        fields: ['id', 'displayName', 'formattedAddress', 'location'],
        locationBias: { center: point, radius: 6000 },
        maxResultCount: 8,
      })
      if (currentRequest !== requestId.current) return
      setResults(places)
      setSearchState(places.length ? 'results' : 'empty')
    } catch (reason) {
      if (currentRequest !== requestId.current) return
      setSearchErrorKind(classifySearchError(reason))
      setSearchState('error')
    }
  }

  function mapReady(api: MapsApi) {
    setMapsApi(api)
    setMapState('ready')
    setMapError('')
  }

  function mapFailed(message: string) {
    setMapsApi(null)
    setMapError(message)
    setMapState('error')
  }

  return {
    query, setQuery, point, pointName, locationMessage,
    mapState, mapError, searchState, searchErrorKind,
    results, searchedQuery, selectedId, setSelectedId,
    updatePoint, chooseCity, requestLocation, submitSearch, mapReady, mapFailed,
  }
}
