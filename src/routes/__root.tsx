import { HeadContent, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthMiniFooter, AuthTopbar } from '../components/auth/shell'
import Footer from '../components/home/layout/Footer'
import Header from '../components/home/layout/Header'
import { AppShell } from '../components/app/AppShell'
import { CartProvider } from '../store/cart'
import { ToastHost, ToastProvider } from '../store/toast'

import appCss from '../styles.css?url'
// Additive dashboard layer — loaded after the master theme, scoped to .gm-app
import dashboardCss from '../dashboard.css?url'
// Page 3 crop-planner additions — token-only and .gm-app scoped
import plannerCss from '../planner.css?url'
// Page 8 weather & climate additions — token-only and .gm-app scoped
import weatherCss from '../weather.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'GrowMO — Smart Farming for Kenya | Plan, Predict, Profit' },
      {
        name: 'description',
        content:
          'GrowMO plans your season, predicts pests, tracks every shilling on M-Pesa and connects you straight to buyers. 128K+ Kenyan farmers grow with us.',
      },
      { name: 'theme-color', content: '#0c2317' },
    ],
    links: [
      // ?v= busts preview/proxy CSS caches — bump it whenever a stylesheet changes
      { rel: 'stylesheet', href: `${appCss}?v=5` },
      { rel: 'stylesheet', href: `${dashboardCss}?v=1` },
      { rel: 'stylesheet', href: `${plannerCss}?v=1` },
      { rel: 'stylesheet', href: `${weatherCss}?v=1` },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    ],
  }),
  shellComponent: RootDocument,
})

/* Marketing chrome on site pages, minimal secure chrome on /auth/* — same master theme */
function Chrome({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isAuth = pathname.startsWith('/auth')
  const isApp = pathname === '/app' || pathname.startsWith('/app/')

  if (isApp) {
    return (
      <>
        <AppShell>{children}</AppShell>
        <ToastHost />
      </>
    )
  }

  if (isAuth) {
    return (
      <>
        <AuthTopbar />
        {children}
        <AuthMiniFooter />
        <ToastHost />
      </>
    )
  }
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ToastHost />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider>
          <CartProvider>
            <Chrome>{children}</Chrome>
          </CartProvider>
        </ToastProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
