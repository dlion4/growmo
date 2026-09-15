import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="container py-5">
      <section className="card mb-4 shadow-sm">
        <div className="card-body text-center py-5">
          <h1 className="display-4 fw-bold mb-3">Welcome to Growmo</h1>
          <p className="lead text-muted mb-4">
            A TanStack Start application with Bootstrap styling
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/about" className="btn btn-primary">
              About This Starter
            </Link>
            <a
              href="https://tanstack.com/router"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary"
            >
              Router Guide
            </a>
          </div>
        </div>
      </section>

      <section className="row g-4 mb-4">
        {[
          {
            title: 'Type-Safe Routing',
            desc: 'Routes and links stay in sync across every page.',
            icon: '🗺️',
          },
          {
            title: 'Server Functions',
            desc: 'Call server code from your UI without creating API boilerplate.',
            icon: '⚡',
          },
          {
            title: 'Streaming by Default',
            desc: 'Ship progressively rendered responses for faster experiences.',
            icon: '🚀',
          },
          {
            title: 'Bootstrap Native',
            desc: 'Design quickly with Bootstrap components and utilities.',
            icon: '🎨',
          },
        ].map((feature) => (
          <div key={feature.title} className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="fs-1 mb-3">{feature.icon}</div>
                <h5 className="card-title fw-bold">{feature.title}</h5>
                <p className="card-text text-muted">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">Quick Start</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Edit <code>src/routes/index.tsx</code> to customize the home page.
            </li>
            <li className="list-group-item">
              Update <code>src/components/Header.tsx</code> and{' '}
              <code>src/components/Footer.tsx</code> for brand links.
            </li>
            <li className="list-group-item">
              Add routes in <code>src/routes</code> and tweak styles in{' '}
              <code>src/styles.css</code>.
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
