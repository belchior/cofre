import { invoke } from '@tauri-apps/api/core'
import * as z from 'zod'
import * as storage from '../../../lib/storage'
import { t } from '../../../lib/translation'

export const customFieldSchema = {
  name: z.string(),
  index: z.number(),
  value: z.string().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  type: z.literal(['text', 'password']),
}
export const contentSchema = {
  created_at: z.string(),
  id: z.uuid({ version: 'v4' }),
  length: z.number(),
  name: z.string().trim().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  data: z.string().optional(),
  secret: z.string().min(1, t('at_least_1_char')).max(255, t('at_most_255_char')),
  starred: z.boolean(),
  custom_fields: z.array(z.object(customFieldSchema)),
}

type ValidationCtx = {
  isContentNew: boolean,
  currentName?: storage.Content['name'],
}

export async function validateContent(content: Partial<storage.Content>, ctx: ValidationCtx) {
  const newSchema = { ...contentSchema }

  newSchema.name = contentSchema.name.refine(async (name) => {
    const nameInUse = await invoke('is_name_been_used', { name })
    if (nameInUse && (ctx.isContentNew === true || ctx.isContentNew === false && ctx.currentName !== name)) {
      return false
    }
    return true
  }, { message: t('name_in_use') })

  return await z.object(newSchema).safeParseAsync(content)
}

export async function validateContentProp<K extends keyof storage.Content>(
  key: K,
  value: storage.Content[K],
  ctx: ValidationCtx
) {
  let propSchema
  switch (key) {
    case 'name': {
      propSchema = contentSchema.name.refine(
        async (name) => {
          const nameInUse = await invoke('is_name_been_used', { name })
          if (nameInUse && (ctx.isContentNew === true || ctx.isContentNew === false && ctx.currentName !== name)) {
            return false
          }
          return true
        },
        { message: t('name_in_use') }
      )
      break
    }
    case 'custom_fields': {
      propSchema = customFieldSchema.value
      break
    }
    default: {
      propSchema = contentSchema[key]
      break
    }
  }

  const result = await z.object({ [key]: propSchema }).safeParseAsync({ [key]: value })

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
