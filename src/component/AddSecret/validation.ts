import * as z from 'zod'
import { isNameBeenUsed, type Content } from '../../lib/storage'

export const customFieldSchema = {
  name: z.string(),
  index: z.number(),
  value: z.string().min(1, 'no mímino 1 caracter').max(255, 'no máxino 255 caracteres'),
  type: z.literal(['text', 'password']),
}
export const contentSchema = {
  createdAt: z.string(),
  id: z.string().uuid({ version: 'v4' }),
  length: z.number(),
  name: z.string().trim().min(1, 'no mímino 1 caracter').max(255, 'no máxino 255 caracteres'),
  data: z.string().optional(),
  secret: z.string().min(1, 'no mímino 1 caracter').max(255, 'no máxino 255 caracteres'),
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
  }, { message: 'nome em uso' })

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
        { message: 'nome em uso' }
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
  name: z.string().trim().min(1, 'no mímino 1 caracter').max(255, 'no máxino 255 caracteres'),
  isSecret: z.boolean(),
})

export type Field = z.infer<typeof FieldSchema>

export function validateField(field: Partial<Field>) {
  return FieldSchema.safeParse(field)
}
