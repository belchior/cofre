import * as z from 'zod'
import { isNameBeenUsed, type Content } from '../../lib/storage'
import { t } from '../../lib/translation'

export const customFieldSchema = {
  name: z.string(),
  index: z.number(),
  value: z.string().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  type: z.literal(['text', 'password']),
}
export const contentSchema = {
  createdAt: z.string(),
  id: z.string().uuid({ version: 'v4' }),
  length: z.number(),
  name: z.string().trim().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  data: z.string().optional(),
  secret: z.string().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  starred: z.boolean(),
  customFields: z.array(z.object(customFieldSchema)),
}

type ValidationCtx = {
  isContentNew: boolean,
  currentName?: Content['name'],
}

export function validateContent(content: Partial<Content>, ctx: ValidationCtx) {
  const newSchema = { ...contentSchema }

  newSchema.name = contentSchema.name.refine((name) => {
    const nameInUse = isNameBeenUsed(name as string)
    if (nameInUse && (ctx.isContentNew === true || ctx.isContentNew === false && ctx.currentName !== name)) {
      return false
    }
    return true
  }, { message: t('name_in_use') })

  return z.object(newSchema).safeParse(content)
}

export function validateContentProp<K extends keyof Content>(key: K, value: Content[K], ctx: ValidationCtx) {
  let propSchema
  switch (key) {
    case 'name': {
      propSchema = contentSchema.name.refine(
        (name) => {
          const nameInUse = isNameBeenUsed(name as string)
          if (nameInUse && (ctx.isContentNew === true || ctx.isContentNew === false && ctx.currentName !== name)) {
            return false
          }
          return true
        },
        { message: t('name_in_use') }
      )
      break
    }
    case 'customFields': {
      propSchema = customFieldSchema.value
      break
    }
    default: {
      propSchema = contentSchema[key]
      break
    }
  }

  const result = z.object({ [key]: propSchema }).safeParse({ [key]: value })

  return result.success === false
    ? result.error.issues.at(0)?.message ?? ''
    : ''
}

const FieldSchema = z.object({
  name: z.string().trim().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  isSecret: z.boolean(),
})

export type Field = z.infer<typeof FieldSchema>

export function validateField(field: Partial<Field>) {
  return FieldSchema.safeParse(field)
}
