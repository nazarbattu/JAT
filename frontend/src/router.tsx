import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { RootLayout } from "@/components/layout/RootLayout"
import { CompaniesPage } from "@/pages/companies/CompaniesPage"
import { CompanyDetailPage } from "@/pages/companies/CompanyDetailPage"
import { ContactDetailPage } from "@/pages/contacts/ContactDetailPage"
import { ContactsPage } from "@/pages/contacts/ContactsPage"
import { HomePage } from "@/pages/home/HomePage"
import { JobDetailPage } from "@/pages/jobs/JobDetailPage"
import { JobsPage } from "@/pages/jobs/JobsPage"
import { ThreadPage } from "@/pages/threads/ThreadPage"

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const companiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/companies",
  component: CompaniesPage,
})

const companyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/companies/$companyId",
  component: CompanyDetailPage,
})

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contacts",
  component: ContactsPage,
})

const contactDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contacts/$contactId",
  component: ContactDetailPage,
})

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs",
  component: JobsPage,
})

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$jobId",
  component: JobDetailPage,
})

const threadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/threads/$threadId",
  validateSearch: (search: Record<string, unknown>): {
    tab: "interactions" | "follow-ups" | "contacts"
    focus?: string
  } => ({
    tab:
      search.tab === "follow-ups" ||
      search.tab === "contacts" ||
      search.tab === "interactions"
        ? search.tab
        : "interactions",
    focus: typeof search.focus === "string" ? search.focus : undefined,
  }),
  component: ThreadPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  companiesRoute,
  companyDetailRoute,
  contactsRoute,
  contactDetailRoute,
  jobsRoute,
  jobDetailRoute,
  threadRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
