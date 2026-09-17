export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0 text-muted">
              &copy; {year} Growmo. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0 text-muted">
              Built with TanStack Start & Bootstrap
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
