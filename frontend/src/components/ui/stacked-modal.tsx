import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type DialogOpenChangeHandler = (
  open: boolean,
  details: { reason: string },
) => void

type StackedModalContextValue = {
  /** Number of stacked (child) modals currently open above the base layer. */
  count: number
  push: () => number
  pop: () => void
}

const StackedModalContext = createContext<StackedModalContextValue | null>(null)

export function StackedModalProvider({ children }: { children: ReactNode }) {
  const countRef = useRef(0)
  const [count, setCount] = useState(0)

  const push = useCallback(() => {
    countRef.current += 1
    setCount(countRef.current)
    return countRef.current
  }, [])

  const pop = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    setCount(countRef.current)
  }, [])

  const value = useMemo(
    () => ({ count, push, pop }),
    [count, push, pop],
  )

  return (
    <StackedModalContext.Provider value={value}>
      {children}
    </StackedModalContext.Provider>
  )
}

function useStackedModalContext() {
  const ctx = useContext(StackedModalContext)
  if (!ctx) {
    throw new Error("StackedModalProvider is required")
  }
  return ctx
}

/**
 * Register an open stacked modal and return its layer (1-based) for z-index.
 */
export function useStackedModalLayer(open: boolean) {
  const { push, pop } = useStackedModalContext()
  const [layer, setLayer] = useState(0)

  useEffect(() => {
    if (!open) {
      setLayer(0)
      return
    }
    const next = push()
    setLayer(next)
    return () => {
      pop()
      setLayer(0)
    }
  }, [open, push, pop])

  return layer
}

export function stackedModalZIndexClass(layer: number) {
  if (layer <= 0) return "z-50"
  if (layer === 1) return "z-[60]"
  if (layer === 2) return "z-[70]"
  return "z-[80]"
}

/**
 * Keeps a base dialog open while a stacked modal is above it,
 * and ignores focus-out closes that fire when the top modal dismisses.
 */
export function useBaseDialogOpenChange(
  setOpen: (open: boolean) => void,
): DialogOpenChangeHandler {
  const { count } = useStackedModalContext()

  return useCallback(
    (open, details) => {
      if (!open && count > 0) return
      if (!open && details.reason === "focusOut") return
      setOpen(open)
    },
    [count, setOpen],
  )
}
