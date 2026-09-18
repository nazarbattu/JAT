import { z } from "zod"

/** Empty string, or an absolute http/https URL. */
export const optionalHttpUrl = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value === "") return true
      try {
        const url = new URL(value)
        return url.protocol === "http:" || url.protocol === "https:"
      } catch {
        return false
      }
    },
    { message: "Enter a valid http(s) URL" },
  )

export const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value === "") return true
      return z.email().safeParse(value).success
    },
    { message: "Enter a valid email" },
  )
