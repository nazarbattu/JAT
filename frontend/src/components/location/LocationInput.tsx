import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { MapPinIcon } from "lucide-react"
import { cn } from "cn"
import { Input } from "@/components/ui/input"
import {
  preloadLocationIndex,
  searchLocations,
  type LocationSuggestion,
} from "@/lib/locations"

export type LocationInputProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
}

export function LocationInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Type a city name…",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: LocationInputProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    preloadLocationIndex()
  }, [])

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setIsSearching(false)
      setActiveIndex(-1)
      return
    }

    let cancelled = false
    setIsSearching(true)
    const timer = window.setTimeout(() => {
      void searchLocations(trimmed).then((results) => {
        if (cancelled) return
        setSuggestions(results)
        setIsSearching(false)
        setActiveIndex(results.length > 0 ? 0 : -1)
      })
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  function selectSuggestion(suggestion: LocationSuggestion) {
    setQuery(suggestion.label)
    onChange(suggestion.label)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === "Escape") setOpen(false)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      )
      return
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[activeIndex]!)
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
    }
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPinIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-invalid={ariaInvalid}
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          className="pl-7"
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            onChange(next)
            setOpen(true)
          }}
        />
      </div>

      {showPanel && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isSearching && suggestions.length === 0 && (
            <li className="px-2 py-1.5 text-xs text-muted-foreground">
              Searching cities…
            </li>
          )}

          {!isSearching && suggestions.length === 0 && (
            <li className="px-2 py-1.5 text-xs text-muted-foreground">
              No cities found
            </li>
          )}

          {suggestions.map((suggestion, index) => {
            const active = index === activeIndex
            return (
              <li
                key={suggestion.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={active}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-1.5 text-xs",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectSuggestion(suggestion)
                }}
              >
                <div className="font-medium">{suggestion.city}</div>
                <div className="text-muted-foreground">
                  {suggestion.state}, {suggestion.country}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
