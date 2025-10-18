import * as z from 'zod'
import type { Content } from '../../lib/dataLayer'

const validation = z.object({
  createdAt: z.string(),
  id: z.string(),
  length: z.number(),
  name: z.string().min(1, 'muito pequeno').max(255, 'muito grande'),
  data: z.string().optional(),
  secret: z.string().min(1).max(255),
  starred: z.boolean(),
})

export function isValidContent(content: Partial<Content>) {
  return validation.safeParse(content)
}
