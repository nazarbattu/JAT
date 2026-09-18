import { useMemo, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  stackedModalZIndexClass,
  useStackedModalLayer,
} from "@/components/ui/stacked-modal"
import { CompanyForm } from "@/features/companies/CompanyForm"
import { companyKeys, createCompany } from "@/features/companies/api"
import { cn } from "cn"
import type { Company, CompanyInput } from "@/types/company"

type CompanyComboboxProps = {
  value: string
  onChange: (companyId: string) => void
  companies: Company[]
  /** Company ids to hide from the list (e.g. employer). */
  excludeIds?: string[]
  placeholder?: string
  disabled?: boolean
  allowAdd?: boolean
  "aria-invalid"?: boolean
  id?: string
}

export function CompanyCombobox({
  value,
  onChange,
  companies,
  excludeIds = [],
  placeholder = "Search company…",
  disabled = false,
  allowAdd = true,
  "aria-invalid": ariaInvalid,
  id,
}: CompanyComboboxProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [pendingName, setPendingName] = useState("")
  const searchRef = useRef("")
  const layer = useStackedModalLayer(addOpen)
  const zClass = stackedModalZIndexClass(layer)

  const excludeKey = excludeIds.filter(Boolean).join(",")
  const options = useMemo(() => {
    const exclude = new Set(excludeKey ? excludeKey.split(",") : [])
    return companies
      .filter((company) => !exclude.has(company.id))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [companies, excludeKey])

  const selected = useMemo(
    () => companies.find((company) => company.id === value),
    [companies, value],
  )

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
      onChange(company.id)
      setAddOpen(false)
      setPendingName("")
      searchRef.current = ""
    },
  })

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={ariaInvalid}
              aria-expanded={open}
              className="h-8 w-full justify-between font-normal"
            />
          }
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.name ?? placeholder}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        {open && (
          <PopoverContent align="start" className="w-80 p-0" sideOffset={4}>
            <Command>
              <CommandInput
                placeholder="Search or add a company…"
                onValueChange={(next) => {
                  searchRef.current = next
                }}
              />
              <CommandList>
                <CommandEmpty>No company found.</CommandEmpty>
                <CommandGroup>
                  {options.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name}
                      data-checked={company.id === value || undefined}
                      onSelect={() => {
                        onChange(company.id)
                        setOpen(false)
                        searchRef.current = ""
                      }}
                    >
                      <span className="truncate">{company.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {allowAdd && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        value="__add_company__"
                        onSelect={() => {
                          setPendingName(searchRef.current.trim())
                          setOpen(false)
                          setAddOpen(true)
                        }}
                      >
                        <PlusIcon className="size-3.5" />
                        Add company
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        {addOpen ? (
          <DialogContent
            className={cn(
              "max-h-[90vh] overflow-y-auto sm:max-w-md",
              zClass,
            )}
            overlayClassName={zClass}
          >
            <DialogHeader>
              <DialogTitle>Add company</DialogTitle>
              <DialogDescription>
                Create a company and select it here.
              </DialogDescription>
            </DialogHeader>
            <CompanyForm
              key={pendingName || "new-company"}
              initial={
                pendingName
                  ? {
                      id: "",
                      name: pendingName,
                      website: null,
                      careersUrl: null,
                      location: null,
                      notes: null,
                      createdAt: "",
                      updatedAt: "",
                    }
                  : undefined
              }
              submitLabel="Create & select"
              isSubmitting={createMutation.isPending}
              onCancel={() => setAddOpen(false)}
              onSubmit={async (input: CompanyInput) => {
                await createMutation.mutateAsync(input)
              }}
            />
            {createMutation.isError && (
              <p className="text-xs text-destructive">Could not create company.</p>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}
