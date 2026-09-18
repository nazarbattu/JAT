import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  interactionSchema,
  type InteractionFormValues,
} from "@/features/interactions/schema"
import { instantToLocalInput, localInputToInstant } from "@/lib/datetime"
import type { Contact, ContactInput } from "@/types/contact"
import {
  INTERACTION_CHANNELS,
  INTERACTION_CHANNEL_LABELS,
  INTERACTION_DIRECTIONS,
  type InteractionInput,
} from "@/types/interaction"

type InteractionFormInitial = {
  direction: InteractionFormValues["direction"]
  channel: InteractionFormValues["channel"]
  occurredAt: string
  subject?: string | null
  summary?: string | null
  externalRef?: string | null
  contactId: string
  remark?: string | null
}

type InteractionFormProps = {
  threadId: string
  companyId: string
  contacts: Contact[]
  initial?: InteractionFormInitial
  submitLabel?: string
  onSubmit: (input: InteractionInput) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

export function InteractionForm({
  threadId,
  companyId,
  contacts,
  initial,
  submitLabel = "Log interaction",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InteractionFormProps) {
  const queryClient = useQueryClient()
  const [addContactOpen, setAddContactOpen] = useState(false)

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      direction: initial?.direction ?? "outbound",
      channel: initial?.channel ?? "email",
      occurredAt: instantToLocalInput(
        initial?.occurredAt ?? new Date().toISOString(),
      ),
      subject: initial?.subject ?? "",
      summary: initial?.summary ?? "",
      externalRef: initial?.externalRef ?? "",
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
  const directionItems = Object.fromEntries(
    INTERACTION_DIRECTIONS.map((value) => [value, value]),
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
          const occurredAt = localInputToInstant(values.occurredAt)
          if (!occurredAt) return
          await onSubmit({
            threadId,
            direction: values.direction,
            channel: values.channel,
            occurredAt,
            subject: emptyToNull(values.subject),
            summary: emptyToNull(values.summary),
            externalRef: emptyToNull(values.externalRef),
            contactId: values.contactId,
            remark: emptyToNull(values.remark),
          })
        })}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label>Contact</Label>
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
                <SelectTrigger className="w-full" aria-invalid={!!errors.contactId}>
                  <SelectValue
                    placeholder={
                      contacts.length === 0
                        ? "Add a contact first"
                        : "Select contact"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Direction</Label>
            <Controller
              control={form.control}
              name="direction"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                  items={directionItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACTION_DIRECTIONS.map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Channel</Label>
            <Controller
              control={form.control}
              name="channel"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                  items={channelItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="occurredAt">When</Label>
          <Input
            id="occurredAt"
            type="datetime-local"
            {...form.register("occurredAt")}
            aria-invalid={!!errors.occurredAt}
          />
          {errors.occurredAt && (
            <p className="text-xs text-destructive">{errors.occurredAt.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" {...form.register("subject")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" rows={3} {...form.register("summary")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="remark">Remarks</Label>
          <Textarea
            id="remark"
            rows={3}
            placeholder="What was said / decided (especially for calls)"
            {...form.register("remark")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="externalRef">External ref</Label>
          <Input
            id="externalRef"
            placeholder="Mail / WhatsApp link"
            {...form.register("externalRef")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>
              Create a company contact and select them for this interaction.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            defaultCompanyId={companyId}
            lockCompany
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
      </Dialog>
    </>
  )
}
