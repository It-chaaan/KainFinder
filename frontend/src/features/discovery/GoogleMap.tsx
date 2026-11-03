import { useEffect, useRef, useState } from 'react'
import { loadMaps, mapsKey } from './googleMaps'
import type { MapInstance, MapsApi, Marker, Place, Point } from './googleMaps'
import { MANILA } from './locations'
import type { MapState } from './useDiscovery'
import { straightLineDistanceKm } from './distance'

type Props = {
  point: Point
  pointName: string
  results: Place[]
  selectedId: string | null
  mapState: MapState
  mapError: string
  onPointSelect: (point: Point, name: string, message: string) => void
  onPlaceSelect: (place: Place) => void
  onReady: (api: MapsApi) => void
  onError: (message: string) => void
}

export function GoogleMap({
  point, pointName, results, selectedId, mapState, mapError,
  onPointSelect, onPlaceSelect, onReady, onError,
}: Props) {
  const mapElement = useRef<HTMLDivElement>(null)
  const map = useRef<MapInstance | null>(null)
  const maps = useRef<MapsApi | null>(null)
  const markers = useRef<{ placeId: string; index: number; marker: Marker }[]>([])
  const pointMarker = useRef<Marker | null>(null)
  const firstCameraUpdate = useRef(true)
  const callbacks = useRef({ onPointSelect, onPlaceSelect, onReady, onError })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    callbacks.current = { onPointSelect, onPlaceSelect, onReady, onError }
  }, [onPointSelect, onPlaceSelect, onReady, onError])

  useEffect(() => {
    if (!mapsKey || !mapElement.current) return
    let active = true
    let clickListener: { remove: () => void } | undefined
    const authFailure = () => {
      if (active) callbacks.current.onError('Google Maps rejected this browser key. Check its allowed websites and API access.')
    }
    window.addEventListener('craveit:maps-auth-failure', authFailure)

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
        callbacks.current.onPointSelect(chosen, 'Pinned point', 'Search center moved on the map. Submit again to search here.')
      })
      setReady(true)
      callbacks.current.onReady(api)
    }).catch((reason: unknown) => {
      if (active) callbacks.current.onError(reason instanceof Error ? reason.message : 'Google Maps could not load.')
    })

    return () => {
      active = false
      window.removeEventListener('craveit:maps-auth-failure', authFailure)
      clickListener?.remove()
      markers.current.forEach(({ marker }) => marker.setMap(null))
      pointMarker.current?.setMap(null)
    }
  }, [])

  useEffect(() => {
    if (!maps.current || !map.current || !ready || mapState !== 'ready') return
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
    if (firstCameraUpdate.current) firstCameraUpdate.current = false
    else map.current.setZoom(14)
  }, [point, pointName, ready, mapState])

  useEffect(() => {
    if (!maps.current || !map.current || !ready) return
    const api = maps.current
    const currentMap = map.current
    const styles = getComputedStyle(document.documentElement)
    const nextMarkers = results.flatMap((place, index) => {
      if (!place.location || straightLineDistanceKm(point, {
        lat: place.location.lat(), lng: place.location.lng(),
      }) === null) return []
      const marker = new api.Marker({
        map: currentMap, position: place.location,
        title: `${index + 1}. ${place.displayName ?? 'Restaurant'}`,
        icon: {
          path: api.SymbolPath.CIRCLE, scale: 13,
          fillColor: styles.getPropertyValue('--color-map-pin-selected').trim(), fillOpacity: 1,
          strokeColor: styles.getPropertyValue('--color-map-pin-ring').trim(), strokeWeight: 2,
        },
        label: { text: String(index + 1), color: styles.getPropertyValue('--color-map-pin-label').trim() },
      })
      marker.addListener('click', () => callbacks.current.onPlaceSelect(place))
      return [{ placeId: place.id, index, marker }]
    })
    markers.current = nextMarkers
    return () => {
      nextMarkers.forEach(({ marker }) => marker.setMap(null))
      markers.current = []
    }
  }, [results, ready])

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    markers.current.forEach(({ placeId, index, marker }) => {
      const selected = placeId === selectedId
      marker.setIcon(maps.current ? {
        path: maps.current.SymbolPath.CIRCLE, scale: selected ? 16 : 13,
        fillColor: styles.getPropertyValue('--color-map-pin-selected').trim(), fillOpacity: 1,
        strokeColor: styles.getPropertyValue('--color-map-pin-ring').trim(), strokeWeight: selected ? 3 : 2,
      } : undefined)
      marker.setLabel({ text: String(index + 1), color: styles.getPropertyValue('--color-map-pin-label').trim() })
    })
    const selectedPlace = results.find((place) => place.id === selectedId)
    if (selectedPlace?.location && map.current && straightLineDistanceKm(point, {
      lat: selectedPlace.location.lat(), lng: selectedPlace.location.lng(),
    }) !== null) {
      map.current.setCenter({ lat: selectedPlace.location.lat(), lng: selectedPlace.location.lng() })
    }
  }, [selectedId, results, ready])

  return (
    <div className="map-wrap">
      <div ref={mapElement} className="map" aria-label="Google Map of Metro Manila" />
      {mapState !== 'ready' && (
        <div className="map-overlay" role="status">
          <strong>{mapState === 'missing-key' ? 'Map key needed' : mapState === 'loading' ? 'Loading Google Map…' : 'Map unavailable'}</strong>
          {mapState === 'missing-key' && <p>Set VITE_GOOGLE_MAPS_API_KEY in frontend/.env, then restart the app.</p>}
          {mapState === 'error' && <><p>{mapError}</p><button className="ui-button ui-button--outline" type="button" onClick={() => window.location.reload()}>Reload map</button></>}
        </div>
      )}
    </div>
  )
}
