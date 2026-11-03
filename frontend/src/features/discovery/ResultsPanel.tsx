import { useEffect, useRef, useState } from 'react'
import type { Place, Point } from './googleMaps'
import type { SearchErrorKind, SearchState } from './useDiscovery'
import { formatStraightLineDistance, straightLineDistanceKm } from './distance'

type Props = {
  point: Point
  pointName: string
  results: Place[]
  searchedQuery: string
  searchState: SearchState
  searchErrorKind: SearchErrorKind
  selectedId: string | null
  onPlaceSelect: (place: Place) => void
}

export function ResultsPanel({
  point, pointName, results, searchedQuery, searchState, searchErrorKind,
  selectedId, onPlaceSelect,
}: Props) {
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (selectedId) setExpanded(true)
  }, [selectedId])

  useEffect(() => {
    if (!selectedId || !expanded) return
    cardRefs.current[selectedId]?.scrollIntoView({
      block: 'nearest',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }, [selectedId, expanded])

  useEffect(() => {
    if (searchState !== 'idle') setExpanded(true)
  }, [searchState])

  return (
    <div className={expanded ? 'results-panel' : 'results-panel results-panel--collapsed'}>
      <div className="results-heading">
        <div>
          <span className="results-kicker">YOUR DISCOVERY</span>
          <h2 id="results-heading" tabIndex={-1}>Places <span className="result-count">{searchState === 'results' ? results.length : '—'}</span></h2>
        </div>
        <button type="button" className="sheet-toggle" aria-expanded={expanded} aria-controls="results-content" onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide list' : 'Show list'} <span aria-hidden="true">{expanded ? '⌄' : '⌃'}</span></button>
      </div>
      <div id="results-content" className="results-content" aria-live="polite">
      {searchState === 'idle' && <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌕</span><h3>Your next meal starts here.</h3><p>Search for a restaurant, cuisine, or dish near your chosen point. Places will appear here and on the map.</p></div>}
      {searchState === 'loading' && <p className="state-copy" role="status">Finding places near {pointName}…</p>}
      {searchState === 'empty' && <p className="state-copy">No places found for “{searchedQuery}” near {pointName}. Try another term or search center.</p>}
      {searchState === 'error' && (
        <div className="state-copy" role="alert">
          <p>{searchErrorKind === 'limit'
            ? 'Google search has reached a usage limit. Please try again later.'
            : searchErrorKind === 'network'
              ? 'The connection failed. Check your network, then press Search to retry.'
              : 'Search is unavailable. Check the Google API setup, then press Search to retry.'}</p>
        </div>
      )}
      {searchState === 'results' && (
        <>
          <p className="results-note">Suggestions for “{searchedQuery}” near {pointName}. A dish search does not confirm it is on a menu.</p>
          <ol className="result-list">
            {results.map((place, index) => {
              const destination = place.location
                ? { lat: place.location.lat(), lng: place.location.lng() }
                : null
              const distance = straightLineDistanceKm(point, destination)
              return (
                <li key={place.id} ref={(element) => { cardRefs.current[place.id] = element }} className={selectedId === place.id ? 'result-card selected' : 'result-card'}>
                  <button type="button" onClick={() => onPlaceSelect(place)} aria-pressed={selectedId === place.id}>
                    <span className="result-index">{index + 1}</span>
                    <span>
                      <strong>{place.displayName ?? 'Place'}</strong>
                      <small>{place.formattedAddress ?? 'Address unavailable'}</small>
                      <small className="result-distance">{formatStraightLineDistance(distance)}</small>
                    </span>
                  </button>
                  {destination && distance !== null && <a target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${place.displayName ?? 'this place'} in Google Maps`} href={`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&destination_place_id=${encodeURIComponent(place.id)}`}>Directions <span aria-hidden="true">↗</span></a>}
                </li>
              )
            })}
          </ol>
        </>
      )}
      </div>
    </div>
  )
}
