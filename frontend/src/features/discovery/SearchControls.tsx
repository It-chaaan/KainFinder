import type { FormEvent } from 'react'
import { CITIES } from './locations'
import type { MapState, SearchState } from './useDiscovery'

type Props = {
  query: string
  pointName: string
  locationMessage: string
  mapState: MapState
  searchState: SearchState
  onQueryChange: (query: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCitySelect: (name: string) => void
  onLocationRequest: () => void
}

export function SearchControls({
  query, pointName, locationMessage, mapState, searchState,
  onQueryChange, onSubmit, onCitySelect, onLocationRequest,
}: Props) {
  return (
    <section className="control-panel" aria-label="Find food">
      <div className="intro">
        <p className="eyebrow">EXPLORE METRO MANILA</p>
        <h1>What are you craving?</h1>
        <p>Find a good place around the point you choose.</p>
      </div>
      <form onSubmit={onSubmit} className="search-form">
        <label className="ui-label" htmlFor="food-query">Restaurant, cuisine, or dish</label>
        <div className="search-row">
          <input className="ui-field" id="food-query" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Try ramen or Filipino food" autoComplete="off" required />
          <button className="ui-button ui-button--primary" type="submit" disabled={mapState !== 'ready' || searchState === 'loading'}>
            {searchState === 'loading' ? 'Searching…' : `Search near ${pointName}`}
          </button>
        </div>
      </form>
      <div className="location-section">
        <div className="section-heading">
          <span className="section-number" aria-hidden="true">01</span>
          <h2>Search center</h2>
        </div>
        <div className="current-point">
          <span className="point-symbol" aria-hidden="true">◎</span>
          <div><span className="point-caption">SEARCHING AROUND</span><strong>{pointName}</strong></div>
        </div>
        <label className="ui-label" htmlFor="city">Choose a city center</label>
        <select className="ui-field" id="city" value={CITIES.some((city) => city.name === pointName) ? pointName : ''} onChange={(event) => onCitySelect(event.target.value)}>
          <option value="" disabled>Choose a city</option>
          {CITIES.map((city) => <option key={city.name}>{city.name}</option>)}
        </select>
        <button type="button" className="ui-button ui-button--outline location-button" onClick={onLocationRequest}>Use my location <span aria-hidden="true">↗</span></button>
        <p className="helper">Or tap the map to place your search center. Nearby suggestions can cross city boundaries.</p>
        <p className="location-message" role="status">{locationMessage}</p>
      </div>
      <a className="skip-results" href="#results-heading">Skip map to results</a>
    </section>
  )
}
