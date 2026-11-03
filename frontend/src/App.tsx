import { GoogleMap } from './features/discovery/GoogleMap'
import { ResultsPanel } from './features/discovery/ResultsPanel'
import { SearchControls } from './features/discovery/SearchControls'
import { useDiscovery } from './features/discovery/useDiscovery'

function App() {
  const discovery = useDiscovery()

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Crave It, back to search">
          <img src="/crave-it-mark.svg" alt="" width="36" height="36" />
          <span className="wordmark">Crave It<span className="wordmark-period">.</span></span>
        </a>
        <span className="header-note">Find food around you</span>
      </header>
      <div className="workspace" id="top">
        <SearchControls
          query={discovery.query}
          pointName={discovery.pointName}
          locationMessage={discovery.locationMessage}
          mapState={discovery.mapState}
          searchState={discovery.searchState}
          onQueryChange={discovery.setQuery}
          onSubmit={discovery.submitSearch}
          onCitySelect={discovery.chooseCity}
          onLocationRequest={discovery.requestLocation}
        />
        <section className="map-panel" aria-label="Google map and search results">
          <GoogleMap
            point={discovery.point}
            pointName={discovery.pointName}
            results={discovery.results}
            selectedId={discovery.selectedId}
            mapState={discovery.mapState}
            mapError={discovery.mapError}
            onPointSelect={discovery.updatePoint}
            onPlaceSelect={(place) => discovery.setSelectedId(place.id === discovery.selectedId ? null : place.id)}
            onReady={discovery.mapReady}
            onError={discovery.mapFailed}
          />
          <ResultsPanel
            point={discovery.point}
            pointName={discovery.pointName}
            results={discovery.results}
            searchedQuery={discovery.searchedQuery}
            searchState={discovery.searchState}
            searchErrorKind={discovery.searchErrorKind}
            selectedId={discovery.selectedId}
            onPlaceSelect={(place) => discovery.setSelectedId(place.id === discovery.selectedId ? null : place.id)}
          />
        </section>
      </div>
      <footer className="site-footer">
        <span>Crave It search prototype</span>
        <nav aria-label="Legal information">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms of use</a>
        </nav>
      </footer>
    </main>
  )
}

export default App
