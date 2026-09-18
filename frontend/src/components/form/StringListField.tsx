import { PlusIcon, Trash2Icon } from "lucide-react"
import type { HTMLInputTypeAttribute } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StringListFieldProps = {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  type?: HTMLInputTypeAttribute
  addLabel?: string
  "aria-invalid"?: boolean
}

export function StringListField({
  values,
  onChange,
  placeholder,
  type = "text",
  addLabel = "Add",
  "aria-invalid": ariaInvalid,
}: StringListFieldProps) {
  const items = values.length > 0 ? values : [""]

  function updateAt(index: number, next: string) {
    const copy = [...items]
    copy[index] = next
    onChange(copy)
  }

  function removeAt(index: number) {
    const copy = items.filter((_, i) => i !== index)
    onChange(copy.length > 0 ? copy : [""])
  }

  function addRow() {
    onChange([...items, ""])
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            type={type}
            value={value}
            placeholder={placeholder}
            aria-invalid={ariaInvalid}
            onChange={(event) => updateAt(index, event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={items.length === 1 && !value}
            onClick={() => removeAt(index)}
            aria-label="Remove"
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="self-start" onClick={addRow}>
        <PlusIcon data-icon="inline-start" />
        {addLabel}
      </Button>
    </div>
  )
}
