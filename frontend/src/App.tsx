function App() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between border-b border-stone-200 pb-6">
          <span className="text-xl font-bold tracking-tight text-emerald-800">KainFinder</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            Project scaffold
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Welcome to KainFinder
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Good food starts with a place to find it.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
              This is the starting point for KainFinder. The experience is coming together, one step at a time.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {['React', 'TypeScript', 'Tailwind CSS'].map((technology) => (
              <div key={technology} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <span className="mb-3 block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <p className="font-semibold">{technology}</p>
                <p className="mt-1 text-sm text-stone-500">Ready for development</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-stone-200 pt-5 text-sm text-stone-500">
          Made for the next KainFinder chapter.
        </footer>
      </div>
    </main>
  )
}

export default App
