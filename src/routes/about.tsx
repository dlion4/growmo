import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="container py-5">
      <section className="card shadow-sm">
        <div className="card-body py-5">
          <h1 className="display-4 fw-bold mb-3">About Growmo</h1>
          <p className="lead text-muted">
            TanStack Start gives you type-safe routing, server functions, and
            modern SSR defaults. Use this as a clean foundation, then layer in
            your own routes, styling, and add-ons.
          </p>
          <hr className="my-4" />
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">Features</h5>
              <ul className="list-unstyled">
                <li className="mb-2">✅ Type-safe routing</li>
                <li className="mb-2">✅ Server functions</li>
                <li className="mb-2">✅ Modern SSR defaults</li>
                <li className="mb-2">✅ Bootstrap integration</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">Tech Stack</h5>
              <ul className="list-unstyled">
                <li className="mb-2">🔧 TanStack Start</li>
                <li className="mb-2">⚛️ React 19</li>
                <li className="mb-2">🎨 Bootstrap 5</li>
                <li className="mb-2">🔍 Biome for linting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
