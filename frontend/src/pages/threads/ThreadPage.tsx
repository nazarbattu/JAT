import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { companyKeys, getCompany } from "@/features/companies/api"
import { listContacts, contactKeys } from "@/features/contacts/api"
import { FollowUpForm } from "@/features/follow-ups/FollowUpForm"
import {
  createFollowUpWithRemark,
  deleteFollowUp,
  followUpKeys,
  listFollowUps,
  updateFollowUp,
  updateFollowUpWithRemark,
} from "@/features/follow-ups/api"
import { InteractionForm } from "@/features/interactions/InteractionForm"
import {
  createInteractionWithContact,
  deleteInteraction,
  interactionKeys,
  listInteractionContactsByThread,
  listInteractions,
  updateInteractionWithContact,
} from "@/features/interactions/api"
import { getJob, jobKeys } from "@/features/jobs/api"
import { listRemarks, remarkKeys } from "@/features/remarks/api"
import {
  getThread,
  listThreadContacts,
  threadKeys,
  updateThread,
} from "@/features/threads/api"
import {
  FOLLOW_UP_SOURCE_LABELS,
  FOLLOW_UP_STATUS_LABELS,
  type FollowUp,
  type FollowUpInput,
} from "@/types/follow-up"
import {
  INTERACTION_CHANNEL_LABELS,
  type Interaction,
  type InteractionInput,
} from "@/types/interaction"
import type { Remark } from "@/types/remark"
import {
  THREAD_ORIGINS,
  THREAD_ORIGIN_LABELS,
  THREAD_STATUSES,
  THREAD_STATUS_LABELS,
  type ThreadOrigin,
  type ThreadStatus,
} from "@/types/thread"

export function ThreadPage() {
  const { threadId } = useParams({ from: "/threads/$threadId" })
  const { tab, focus } = useSearch({ from: "/threads/$threadId" })
  const navigate = useNavigate({ from: "/threads/$threadId" })
  const queryClient = useQueryClient()

  const [addInteractionOpen, setAddInteractionOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(
    null,
  )
  const [addFollowUpOpen, setAddFollowUpOpen] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null)

  const threadQuery = useQuery({
    queryKey: threadKeys.detail(threadId),
    queryFn: () => getThread(threadId),
  })

  const jobId = threadQuery.data?.jobId
  const jobQuery = useQuery({
    queryKey: jobKeys.detail(jobId ?? "unknown"),
    queryFn: () => getJob(jobId!),
    enabled: !!jobId,
  })

  const companyId = jobQuery.data?.companyId
  const companyQuery = useQuery({
    queryKey: companyKeys.detail(companyId ?? "unknown"),
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  })

  const threadContactsQuery = useQuery({
    queryKey: threadKeys.contacts(threadId),
    queryFn: () => listThreadContacts(threadId),
  })

  const companyContactsQuery = useQuery({
    queryKey: contactKeys.listByCompany(companyId ?? "unknown"),
    queryFn: () => listContacts(companyId),
    enabled: !!companyId,
  })

  const interactionsQuery = useQuery({
    queryKey: interactionKeys.byThread(threadId),
    queryFn: () => listInteractions(threadId),
  })

  const interactionContactsQuery = useQuery({
    queryKey: interactionKeys.contactsByThread(threadId),
    queryFn: () => listInteractionContactsByThread(threadId),
  })

  const followUpsQuery = useQuery({
    queryKey: followUpKeys.byThread(threadId),
    queryFn: () => listFollowUps(threadId),
  })

  const remarksQuery = useQuery({
    queryKey: remarkKeys.byThread(threadId),
    queryFn: () => listRemarks(threadId),
  })

  const contactNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const contact of companyContactsQuery.data ?? []) {
      map.set(contact.id, contact.name)
    }
    return map
  }, [companyContactsQuery.data])

  const contactIdByInteractionId = useMemo(() => {
    const map = new Map<string, string>()
    for (const link of interactionContactsQuery.data ?? []) {
      if (!map.has(link.interactionId)) {
        map.set(link.interactionId, link.contactId)
      }
    }
    return map
  }, [interactionContactsQuery.data])

  const contactsByInteractionId = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const link of interactionContactsQuery.data ?? []) {
      const names = map.get(link.interactionId) ?? []
      const name = contactNameById.get(link.contactId)
      if (name) names.push(name)
      map.set(link.interactionId, names)
    }
    return map
  }, [interactionContactsQuery.data, contactNameById])

  const remarkByInteractionId = useMemo(() => {
    const map = new Map<string, Remark>()
    for (const remark of remarksQuery.data ?? []) {
      if (remark.interactionId && !map.has(remark.interactionId)) {
        map.set(remark.interactionId, remark)
      }
    }
    return map
  }, [remarksQuery.data])

  const remarkByFollowUpId = useMemo(() => {
    const map = new Map<string, Remark>()
    for (const remark of remarksQuery.data ?? []) {
      if (remark.followUpId && !map.has(remark.followUpId)) {
        map.set(remark.followUpId, remark)
      }
    }
    return map
  }, [remarksQuery.data])

  const linksByContactId = useMemo(() => {
    const interactionById = new Map(
      (interactionsQuery.data ?? []).map((interaction) => [
        interaction.id,
        interaction,
      ]),
    )
    const map = new Map<
      string,
      {
        interactions: Interaction[]
        followUps: FollowUp[]
      }
    >()

    const ensure = (contactId: string) => {
      const existing = map.get(contactId)
      if (existing) return existing
      const created = { interactions: [] as Interaction[], followUps: [] as FollowUp[] }
      map.set(contactId, created)
      return created
    }

    for (const link of interactionContactsQuery.data ?? []) {
      const interaction = interactionById.get(link.interactionId)
      if (interaction) {
        ensure(link.contactId).interactions.push(interaction)
      }
    }

    for (const followUp of followUpsQuery.data ?? []) {
      if (followUp.contactId) {
        ensure(followUp.contactId).followUps.push(followUp)
      }
    }

    for (const entry of map.values()) {
      entry.interactions.sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      entry.followUps.sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
      )
    }

    return map
  }, [
    interactionsQuery.data,
    interactionContactsQuery.data,
    followUpsQuery.data,
  ])

  const invalidateThreadData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) }),
      queryClient.invalidateQueries({ queryKey: threadKeys.contacts(threadId) }),
      queryClient.invalidateQueries({ queryKey: interactionKeys.byThread(threadId) }),
      queryClient.invalidateQueries({
        queryKey: interactionKeys.contactsByThread(threadId),
      }),
      queryClient.invalidateQueries({ queryKey: followUpKeys.byThread(threadId) }),
      queryClient.invalidateQueries({ queryKey: remarkKeys.byThread(threadId) }),
    ])
  }

  const updateMetaMutation = useMutation({
    mutationFn: (input: { status?: ThreadStatus; origin?: ThreadOrigin | null }) =>
      updateThread(threadId, {
        status: input.status ?? threadQuery.data?.status,
        origin: input.origin === undefined ? threadQuery.data?.origin : input.origin,
        nextFollowUpAt: threadQuery.data?.nextFollowUpAt ?? null,
        closedAt: threadQuery.data?.closedAt ?? null,
      }),
    onSuccess: invalidateThreadData,
  })

  const createInteractionMutation = useMutation({
    mutationFn: createInteractionWithContact,
    onSuccess: async () => {
      await invalidateThreadData()
      setAddInteractionOpen(false)
    },
  })

  const updateInteractionMutation = useMutation({
    mutationFn: ({
      id,
      input,
      existingRemark,
    }: {
      id: string
      input: InteractionInput
      existingRemark?: Remark | null
    }) => updateInteractionWithContact(id, input, existingRemark),
    onSuccess: async () => {
      await invalidateThreadData()
      setEditingInteraction(null)
    },
  })

  const deleteInteractionMutation = useMutation({
    mutationFn: deleteInteraction,
    onSuccess: invalidateThreadData,
  })

  const createFollowUpMutation = useMutation({
    mutationFn: createFollowUpWithRemark,
    onSuccess: async () => {
      await invalidateThreadData()
      setAddFollowUpOpen(false)
    },
  })

  const updateFollowUpMutation = useMutation({
    mutationFn: ({
      id,
      input,
      existingRemark,
    }: {
      id: string
      input: FollowUpInput
      existingRemark?: Remark | null
    }) => updateFollowUpWithRemark(id, input, existingRemark),
    onSuccess: async () => {
      await invalidateThreadData()
      setEditingFollowUp(null)
    },
  })

  const toggleFollowUpDoneMutation = useMutation({
    mutationFn: (followUp: FollowUp) => {
      const markingDone = followUp.status !== "done"
      return updateFollowUp(followUp.id, {
        threadId: followUp.threadId,
        dueAt: followUp.dueAt,
        source: followUp.source,
        intervalDays: followUp.intervalDays,
        suggestedNote: followUp.suggestedNote,
        channelHint: followUp.channelHint,
        contactId: followUp.contactId,
        status: markingDone ? "done" : "pending",
        completedAt: markingDone ? new Date().toISOString() : null,
        completedInteractionId: markingDone
          ? followUp.completedInteractionId
          : null,
      })
    },
    onSuccess: invalidateThreadData,
  })

  const deleteFollowUpMutation = useMutation({
    mutationFn: deleteFollowUp,
    onSuccess: invalidateThreadData,
  })

  useEffect(() => {
    if (!focus) return
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`thread-item-${focus}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focus, tab, interactionsQuery.data, followUpsQuery.data])

  useEffect(() => {
    if (!focus) return

    const clearFocus = () => {
      void navigate({
        search: { tab, focus: undefined },
        replace: true,
      })
    }

    // Skip the click that activated the link, then clear on any later press.
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", clearFocus)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("pointerdown", clearFocus)
    }
  }, [focus, tab, navigate])

  if (threadQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading thread…</p>
  }

  if (threadQuery.isError || !threadQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">Thread not found.</p>
        <Link
          to="/jobs"
          className="inline-flex h-7 w-fit items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-input/50"
        >
          Back to jobs
        </Link>
      </div>
    )
  }

  const thread = threadQuery.data
  const job = jobQuery.data
  const company = companyQuery.data
  const interactions = [...(interactionsQuery.data ?? [])].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
  const followUps = [...(followUpsQuery.data ?? [])].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  )

  const statusItems = Object.fromEntries(
    THREAD_STATUSES.map((status) => [status, THREAD_STATUS_LABELS[status]]),
  )
  const originItems = Object.fromEntries(
    THREAD_ORIGINS.map((origin) => [origin, THREAD_ORIGIN_LABELS[origin]]),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {job && (
          <Link
            to="/jobs/$jobId"
            params={{ jobId: job.id }}
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            {job.title}
          </Link>
        )}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-medium tracking-tight">
              Thread
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[job?.title, company?.name].filter(Boolean).join(" · ") || "Conversation workspace"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={thread.status}
              onValueChange={(value) => {
                if (value) {
                  updateMetaMutation.mutate({ status: value as ThreadStatus })
                }
              }}
              items={statusItems}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THREAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {THREAD_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={thread.origin}
              onValueChange={(value) => {
                updateMetaMutation.mutate({
                  origin: (value as ThreadOrigin | null) ?? null,
                })
              }}
              items={originItems}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Origin not set" />
              </SelectTrigger>
              <SelectContent>
                {THREAD_ORIGINS.map((origin) => (
                  <SelectItem key={origin} value={origin}>
                    {THREAD_ORIGIN_LABELS[origin]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          void navigate({
            search: {
              tab: value as "interactions" | "follow-ups" | "contacts",
              focus: undefined,
            },
            replace: true,
          })
        }}
        className="gap-4"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="interactions">
            Interactions ({interactions.length})
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            Follow-ups ({followUps.length})
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({threadContactsQuery.data?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddInteractionOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Log interaction
            </Button>
          </div>
          {interactions.length === 0 ? (
            <EmptyState text="No interactions yet. Log the first touch." />
          ) : (
            <div className="flex flex-col gap-3">
              {interactions.map((interaction) => {
                const remark = remarkByInteractionId.get(interaction.id)
                const isFocused = focus === interaction.id
                return (
                  <Card
                    key={interaction.id}
                    id={`thread-item-${interaction.id}`}
                    className={isFocused ? "ring-2 ring-ring" : undefined}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary">
                            {INTERACTION_CHANNEL_LABELS[interaction.channel]}
                          </Badge>
                          <Badge variant="outline">{interaction.direction}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {new Date(interaction.occurredAt).toLocaleString()}
                          {(contactsByInteractionId.get(interaction.id) ?? []).length > 0
                            ? ` · ${(contactsByInteractionId.get(interaction.id) ?? []).join(", ")}`
                            : ""}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingInteraction(interaction)}
                          aria-label="Edit interaction"
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteInteractionMutation.mutate(interaction.id)}
                          aria-label="Delete interaction"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {interaction.subject && (
                        <p className="font-medium">{interaction.subject}</p>
                      )}
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {interaction.summary || "No summary"}
                      </p>
                      {remark && (
                        <p className="whitespace-pre-wrap border-t border-border pt-2 text-muted-foreground">
                          {remark.body}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="follow-ups" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddFollowUpOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Schedule follow-up
            </Button>
          </div>
          {followUps.length === 0 ? (
            <EmptyState text="No follow-ups scheduled." />
          ) : (
            <div className="flex flex-col gap-3">
              {followUps.map((followUp) => {
                const remark = remarkByFollowUpId.get(followUp.id)
                const isDone = followUp.status === "done"
                const isFocused = focus === followUp.id
                return (
                  <Card
                    key={followUp.id}
                    id={`thread-item-${followUp.id}`}
                    className={isFocused ? "ring-2 ring-ring" : undefined}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant={isDone ? "secondary" : "default"}>
                            {FOLLOW_UP_STATUS_LABELS[followUp.status]}
                          </Badge>
                          <span>
                            Due {new Date(followUp.dueAt).toLocaleString()}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {FOLLOW_UP_SOURCE_LABELS[followUp.source]}
                          {followUp.intervalDays
                            ? ` · ${followUp.intervalDays}d`
                            : ""}
                          {followUp.contactId
                            ? ` · ${contactNameById.get(followUp.contactId) ?? "Contact"}`
                            : ""}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant={isDone ? "default" : "outline"}
                          size="icon-sm"
                          onClick={() =>
                            toggleFollowUpDoneMutation.mutate(followUp)
                          }
                          aria-label={isDone ? "Mark pending" : "Mark done"}
                          aria-pressed={isDone}
                        >
                          <CheckIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingFollowUp(followUp)}
                          aria-label="Edit follow-up"
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteFollowUpMutation.mutate(followUp.id)}
                          aria-label="Delete follow-up"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </CardHeader>
                    {(followUp.suggestedNote || remark) && (
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        {followUp.suggestedNote && <p>{followUp.suggestedNote}</p>}
                        {remark && (
                          <p className="whitespace-pre-wrap border-t border-border pt-2">
                            {remark.body}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            People on this thread, added automatically when you log an interaction
            or schedule a follow-up with them.
          </p>
          {(threadContactsQuery.data ?? []).length === 0 ? (
            <EmptyState text="No contacts yet. Log an interaction or schedule a follow-up with a company contact." />
          ) : (
            <div className="flex flex-col gap-3">
              {(threadContactsQuery.data ?? []).map((threadContact) => {
                const links = linksByContactId.get(threadContact.contactId)
                const linkedInteractions = links?.interactions ?? []
                const linkedFollowUps = links?.followUps ?? []

                return (
                  <Card key={threadContact.id}>
                    <CardHeader className="space-y-0">
                      <CardTitle className="text-sm">
                        <Link
                          to="/contacts/$contactId"
                          params={{ contactId: threadContact.contactId }}
                          className="underline-offset-4 hover:underline"
                        >
                          {contactNameById.get(threadContact.contactId) ??
                            "Unknown contact"}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {threadContact.roleOnThread || "On this thread"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Interactions ({linkedInteractions.length})
                        </p>
                        {linkedInteractions.length === 0 ? (
                          <p className="text-muted-foreground">None yet</p>
                        ) : (
                          <ul className="space-y-1">
                            {linkedInteractions.map((interaction) => (
                              <li key={interaction.id}>
                                <Link
                                  to="/threads/$threadId"
                                  params={{ threadId }}
                                  search={{
                                    tab: "interactions",
                                    focus: interaction.id,
                                  }}
                                  className="flex flex-wrap items-center gap-2 rounded-md py-0.5 underline-offset-4 hover:underline"
                                >
                                  <Badge variant="secondary">
                                    {INTERACTION_CHANNEL_LABELS[interaction.channel]}
                                  </Badge>
                                  <Badge variant="outline">
                                    {interaction.direction}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {new Date(interaction.occurredAt).toLocaleString()}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Follow-ups ({linkedFollowUps.length})
                        </p>
                        {linkedFollowUps.length === 0 ? (
                          <p className="text-muted-foreground">None yet</p>
                        ) : (
                          <ul className="space-y-1">
                            {linkedFollowUps.map((followUp) => (
                              <li key={followUp.id}>
                                <Link
                                  to="/threads/$threadId"
                                  params={{ threadId }}
                                  search={{
                                    tab: "follow-ups",
                                    focus: followUp.id,
                                  }}
                                  className="flex flex-wrap items-center gap-2 rounded-md py-0.5 underline-offset-4 hover:underline"
                                >
                                  <Badge
                                    variant={
                                      followUp.status === "pending"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {FOLLOW_UP_STATUS_LABELS[followUp.status]}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    Due {new Date(followUp.dueAt).toLocaleString()}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={addInteractionOpen} onOpenChange={setAddInteractionOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log interaction</DialogTitle>
            <DialogDescription>
              One contact per interaction. Remarks belong on this form.
            </DialogDescription>
          </DialogHeader>
          {companyId ? (
            <InteractionForm
              threadId={threadId}
              companyId={companyId}
              contacts={companyContactsQuery.data ?? []}
              isSubmitting={createInteractionMutation.isPending}
              onCancel={() => setAddInteractionOpen(false)}
              onSubmit={async (input: InteractionInput) => {
                await createInteractionMutation.mutateAsync(input)
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading company…</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingInteraction}
        onOpenChange={(open) => {
          if (!open) setEditingInteraction(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit interaction</DialogTitle>
            <DialogDescription>
              Update the touch and its remarks.
            </DialogDescription>
          </DialogHeader>
          {companyId && editingInteraction ? (
            <InteractionForm
              key={editingInteraction.id}
              threadId={threadId}
              companyId={companyId}
              contacts={companyContactsQuery.data ?? []}
              initial={{
                direction: editingInteraction.direction,
                channel: editingInteraction.channel,
                occurredAt: editingInteraction.occurredAt,
                subject: editingInteraction.subject,
                summary: editingInteraction.summary,
                externalRef: editingInteraction.externalRef,
                contactId:
                  contactIdByInteractionId.get(editingInteraction.id) ?? "",
                remark:
                  remarkByInteractionId.get(editingInteraction.id)?.body ?? "",
              }}
              submitLabel="Save changes"
              isSubmitting={updateInteractionMutation.isPending}
              onCancel={() => setEditingInteraction(null)}
              onSubmit={async (input: InteractionInput) => {
                await updateInteractionMutation.mutateAsync({
                  id: editingInteraction.id,
                  input,
                  existingRemark:
                    remarkByInteractionId.get(editingInteraction.id) ?? null,
                })
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading company…</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addFollowUpOpen} onOpenChange={setAddFollowUpOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule follow-up</DialogTitle>
            <DialogDescription>
              Default is +2 days from now for fixed-interval follow-ups.
            </DialogDescription>
          </DialogHeader>
          {companyId ? (
            <FollowUpForm
              threadId={threadId}
              companyId={companyId}
              contacts={companyContactsQuery.data ?? []}
              isSubmitting={createFollowUpMutation.isPending}
              onCancel={() => setAddFollowUpOpen(false)}
              onSubmit={async (input: FollowUpInput) => {
                await createFollowUpMutation.mutateAsync(input)
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading company…</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingFollowUp}
        onOpenChange={(open) => {
          if (!open) setEditingFollowUp(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit follow-up</DialogTitle>
            <DialogDescription>
              Update schedule details and remarks.
            </DialogDescription>
          </DialogHeader>
          {companyId && editingFollowUp ? (
            <FollowUpForm
              key={editingFollowUp.id}
              threadId={threadId}
              companyId={companyId}
              contacts={companyContactsQuery.data ?? []}
              initial={{
                dueAt: editingFollowUp.dueAt,
                source: editingFollowUp.source,
                intervalDays: editingFollowUp.intervalDays,
                suggestedNote: editingFollowUp.suggestedNote,
                channelHint: editingFollowUp.channelHint,
                contactId: editingFollowUp.contactId,
                status: editingFollowUp.status,
                completedAt: editingFollowUp.completedAt,
                completedInteractionId: editingFollowUp.completedInteractionId,
                remark: remarkByFollowUpId.get(editingFollowUp.id)?.body ?? "",
              }}
              submitLabel="Save changes"
              isSubmitting={updateFollowUpMutation.isPending}
              onCancel={() => setEditingFollowUp(null)}
              onSubmit={async (input: FollowUpInput) => {
                await updateFollowUpMutation.mutateAsync({
                  id: editingFollowUp.id,
                  input,
                  existingRemark:
                    remarkByFollowUpId.get(editingFollowUp.id) ?? null,
                })
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading company…</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
