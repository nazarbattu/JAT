import { z } from "zod"
import { optionalHttpUrl } from "@/lib/validation"
import { JOB_STATUSES } from "@/types/job"

export const jobSchema = z.object({
  companyId: z.string().uuid("Select a company"),
  title: z.string().trim().min(1, "Title is required"),
  portal: z.string().trim(),
  portalApplicationId: z.string().trim(),
  appliedAt: z.string().trim(),
  status: z.enum(JOB_STATUSES),
  jobUrl: optionalHttpUrl,
  notes: z.string().trim(),
})

export type JobFormValues = z.infer<typeof jobSchema>
