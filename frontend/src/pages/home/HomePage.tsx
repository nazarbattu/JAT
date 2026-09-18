import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRightIcon,
  Building2Icon,
  CalendarClockIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  UserRoundIcon,
  BriefcaseBusinessIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { companyKeys, listCompanies } from "@/features/companies/api"
import { contactKeys, listContacts } from "@/features/contacts/api"
import { jobKeys, listJobs } from "@/features/jobs/api"

const capabilities = [
  {
    title: "Companies",
    description: "Store employers once — website, careers page, location, and notes.",
    to: "/companies" as const,
    icon: Building2Icon,
  },
  {
    title: "Contacts",
    description: "Recruiters and hiring managers, reusable across every role at a company.",
    to: "/contacts" as const,
    icon: UserRoundIcon,
  },
  {
    title: "Jobs",
    description: "Track each position with portal, status, and application details.",
    to: "/jobs" as const,
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Threads",
    description: "One conversation workspace per job for outreach until the role closes.",
    to: "/jobs" as const,
    icon: MessagesSquareIcon,
    hint: "Open a job → Open thread",
  },
  {
    title: "Interactions",
    description: "Log calls, email, WhatsApp, and meetings so the timeline stays complete.",
    to: "/jobs" as const,
    icon: MessageSquareTextIcon,
    hint: "Inside each thread",
  },
  {
    title: "Follow-ups",
    description: "Never go quiet — schedule next actions, defaulting to +2 days.",
    to: "/jobs" as const,
    icon: CalendarClockIcon,
    hint: "Inside each thread",
  },
]

const flow = [
  {
    step: "01",
    title: "Company & people",
    body: "Add the employer, then the contacts you talk to.",
  },
  {
    step: "02",
    title: "Track the role",
    body: "Create a job for the position. A thread starts automatically.",
  },
  {
    step: "03",
    title: "Work the thread",
    body: "Log touches, capture remarks, and schedule the next follow-up.",
  },
]

export function HomePage() {
  const companiesQuery = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: listCompanies,
  })
  const contactsQuery = useQuery({
    queryKey: contactKeys.lists(),
    queryFn: () => listContacts(),
  })
  const jobsQuery = useQuery({
    queryKey: jobKeys.lists(),
    queryFn: () => listJobs(),
  })

  const companyCount = companiesQuery.data?.length
  const contactCount = contactsQuery.data?.length
  const jobCount = jobsQuery.data?.length

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in oklch, var(--primary) 28%, transparent), transparent 70%), radial-gradient(ellipse 40% 30% at 100% 20%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 55%), radial-gradient(ellipse 35% 25% at 0% 40%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <section className="flex min-h-[calc(100svh-3.5rem)] flex-col justify-center px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <p className="home-fade-up font-heading text-sm tracking-[0.2em] text-primary uppercase">
            JAT
          </p>
          <h1 className="home-fade-up home-delay-1 mt-4 max-w-3xl font-heading text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Job Application Tracker
          </h1>
          <p className="home-fade-up home-delay-2 mt-5 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
            Follow every role from first outreach to offer — companies, contacts,
            conversations, and follow-ups in one place.
          </p>
          <div className="home-fade-up home-delay-3 mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link to="/jobs" />}
            >
              Open jobs
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link to="/companies" />}
            >
              Browse companies
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            How tracking works
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A job owns one thread. The thread accumulates every contact, touch,
            remark, and next action until you close it.
          </p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {flow.map((item, index) => (
              <li
                key={item.step}
                className="home-fade-up relative"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <span className="font-heading text-xs tracking-[0.18em] text-primary uppercase">
                  {item.step}
                </span>
                <h3 className="mt-3 font-heading text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-medium tracking-tight">
                What you can do
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Everything maps to the real flow of applying and staying in touch.
              </p>
            </div>
            {(companyCount != null || jobCount != null || contactCount != null) && (
              <p className="text-xs text-muted-foreground">
                {[
                  jobCount != null ? `${jobCount} jobs` : null,
                  companyCount != null ? `${companyCount} companies` : null,
                  contactCount != null ? `${contactCount} contacts` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <ul className="mt-10 divide-y divide-border border-y border-border">
            {capabilities.map((capability) => {
              const Icon = capability.icon
              return (
                <li key={capability.title}>
                  <Link
                    to={capability.to}
                    className="group flex flex-col gap-3 py-5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-input/20 text-primary transition-colors group-hover:border-primary/40">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-base font-medium group-hover:text-primary">
                            {capability.title}
                          </h3>
                          {"hint" in capability && capability.hint && (
                            <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                              {capability.hint}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="size-4 shrink-0 self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:self-center" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-medium tracking-tight">
              Stay on the follow-up
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              After each touch, schedule the next move. If they don’t suggest a
              date, JAT defaults to a 2-day interval so roles don’t go quiet.
            </p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to="/jobs" />}
          >
            Continue tracking
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </section>
    </div>
  )
}
