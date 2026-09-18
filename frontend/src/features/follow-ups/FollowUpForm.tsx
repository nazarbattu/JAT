import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  stackedModalZIndexClass,
  useBaseDialogOpenChange,
  useStackedModalLayer,
} from "@/components/ui/stacked-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ContactForm } from "@/features/contacts/ContactForm"
import { contactKeys, createContact } from "@/features/contacts/api"
import {
  followUpSchema,
  type FollowUpFormValues,
} from "@/features/follow-ups/schema"
import { instantToLocalInput, localInputToInstant } from "@/lib/datetime"
import type { Contact, ContactInput } from "@/types/contact"
import {
  FOLLOW_UP_SOURCES,
  FOLLOW_UP_SOURCE_LABELS,
  type FollowUp,
  type FollowUpInput,
} from "@/types/follow-up"
import {
  INTERACTION_CHANNELS,
  INTERACTION_CHANNEL_LABELS,
} from "@/types/interaction"

type FollowUpFormInitial = Pick<
  FollowUp,
  | "dueAt"
  | "source"
  | "intervalDays"
  | "suggestedNote"
  | "channelHint"
  | "contactId"
  | "status"
  | "completedAt"
  | "completedInteractionId"
> & {
  remark?: string | null
}

type FollowUpFormProps = {
  threadId: string
  companyId: string
  contacts: Contact[]
  initial?: FollowUpFormInitial
  submitLabel?: string
  onSubmit: (input: FollowUpInput) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

function defaultDueAt() {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  return instantToLocalInput(date.toISOString())
}

export function FollowUpForm({
  threadId,
  companyId,
  contacts,
  initial,
  submitLabel = "Schedule",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FollowUpFormProps) {
  const queryClient = useQueryClient()
  const [addContactOpen, setAddContactOpen] = useState(false)
  const onAddContactOpenChange = useBaseDialogOpenChange(setAddContactOpen)
  const addContactLayer = useStackedModalLayer(addContactOpen)
  const addContactZ = stackedModalZIndexClass(addContactLayer)

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      dueAt: initial?.dueAt
        ? instantToLocalInput(initial.dueAt)
        : defaultDueAt(),
      source: initial?.source ?? "fixed_interval",
      intervalDays:
        initial?.intervalDays != null ? String(initial.intervalDays) : "2",
      suggestedNote: initial?.suggestedNote ?? "",
      channelHint: initial?.channelHint ?? null,
      contactId: initial?.contactId ?? "",
      remark: initial?.remark ?? "",
    },
  })

  const createContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: async (contact) => {
      await queryClient.invalidateQueries({
        queryKey: contactKeys.listByCompany(companyId),
      })
      await queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      form.setValue("contactId", contact.id, { shouldValidate: true })
      setAddContactOpen(false)
    },
  })

  const { errors } = form.formState
  const sourceItems = Object.fromEntries(
    FOLLOW_UP_SOURCES.map((value) => [value, FOLLOW_UP_SOURCE_LABELS[value]]),
  )
  const channelItems = Object.fromEntries(
    INTERACTION_CHANNELS.map((value) => [
      value,
      INTERACTION_CHANNEL_LABELS[value],
    ]),
  )
  const contactItems = Object.fromEntries(
    contacts.map((contact) => [
      contact.id,
      contact.position ? `${contact.name} · ${contact.position}` : contact.name,
    ]),
  )

  return (
    <>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          const dueAt = localInputToInstant(values.dueAt)
          if (!dueAt) return
          const interval =
            values.intervalDays.trim() === ""
              ? null
              : Number.parseInt(values.intervalDays, 10)

          await onSubmit({
            threadId,
            dueAt,
            source: values.source,
            intervalDays: Number.isFinite(interval) ? interval : null,
            suggestedNote: emptyToNull(values.suggestedNote),
            channelHint: values.channelHint,
            contactId: values.contactId,
            status: initial?.status ?? "pending",
            completedAt: initial?.completedAt ?? null,
            completedInteractionId: initial?.completedInteractionId ?? null,
            remark: emptyToNull(values.remark),
          })
        })}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="contactId">Contact</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddContactOpen(true)}
            >
              <PlusIcon data-icon="inline-start" />
              Add contact
            </Button>
          </div>
          <Controller
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={contactItems}
                disabled={contacts.length === 0}
              >
                <SelectTrigger
                  id="contactId"
                  className="w-full"
                  aria-invalid={!!errors.contactId}
                >
                  <SelectValue
                    placeholder={
                      contacts.length === 0
                        ? "Add a contact first"
                        : "Select a contact"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                      {contact.position ? ` · ${contact.position}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.contactId && (
            <p className="text-xs text-destructive">{errors.contactId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueAt">Due at</Label>
          <Input
            id="dueAt"
            type="datetime-local"
            {...form.register("dueAt")}
            aria-invalid={!!errors.dueAt}
          />
          {errors.dueAt && (
            <p className="text-xs text-destructive">{errors.dueAt.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source">Source</Label>
            <Controller
              control={form.control}
              name="source"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                  items={sourceItems}
                >
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLLOW_UP_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {FOLLOW_UP_SOURCE_LABELS[source]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="intervalDays">Interval days</Label>
            <Input
              id="intervalDays"
              type="number"
              min={1}
              {...form.register("intervalDays")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="channelHint">Channel hint</Label>
          <Controller
            control={form.control}
            name="channelHint"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                items={channelItems}
              >
                <SelectTrigger id="channelHint" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {INTERACTION_CHANNELS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {INTERACTION_CHANNEL_LABELS[channel]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="suggestedNote">Note</Label>
          <Textarea
            id="suggestedNote"
            rows={3}
            placeholder="They said call back Monday…"
            {...form.register("suggestedNote")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="remark">Remarks</Label>
          <Textarea
            id="remark"
            rows={3}
            placeholder="Extra context for this follow-up…"
            {...form.register("remark")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>

      <Dialog open={addContactOpen} onOpenChange={onAddContactOpenChange}>
        {addContactOpen ? (
          <DialogContent
            className={cn(
              "max-h-[90vh] overflow-y-auto sm:max-w-md",
              addContactZ,
            )}
            overlayClassName={addContactZ}
          >
            <DialogHeader>
              <DialogTitle>Add contact</DialogTitle>
              <DialogDescription>
                Create a company contact and select them for this follow-up.
              </DialogDescription>
            </DialogHeader>
            <ContactForm
              defaultCompanyId={companyId}
              submitLabel="Create & select"
              isSubmitting={createContactMutation.isPending}
              onCancel={() => setAddContactOpen(false)}
              onSubmit={async (input: ContactInput) => {
                await createContactMutation.mutateAsync(input)
              }}
            />
            {createContactMutation.isError && (
              <p className="text-xs text-destructive">Could not create contact.</p>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}
