import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import { StackedModalProvider } from "@/components/ui/stacked-modal"

const navLinkClass =
  "text-muted-foreground transition-colors hover:text-foreground data-[status=active]:font-medium data-[status=active]:text-foreground"

export function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === "/"

  return (
    <StackedModalProvider>
      <div className="min-h-svh bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <Link to="/" className="font-heading text-lg font-medium tracking-tight">
              JAT
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
              <Link
                to="/"
                className={navLinkClass}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
              <Link to="/jobs" className={navLinkClass} activeOptions={{ exact: false }}>
                Jobs
              </Link>
              <Link to="/companies" className={navLinkClass} activeOptions={{ exact: false }}>
                Companies
              </Link>
              <Link to="/contacts" className={navLinkClass} activeOptions={{ exact: false }}>
                Contacts
              </Link>
            </nav>
          </div>
        </header>
        <main className={isHome ? "w-full" : "w-full px-4 py-8 sm:px-6"}>
          <Outlet />
        </main>
      </div>
    </StackedModalProvider>
  )
}
