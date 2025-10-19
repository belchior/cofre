import * as z from 'zod'
import { isNameBeenUsed, type Content } from '../../lib/storage'

export const schema = {
  createdAt: z.string(),
  id: z.string().uuid({ version: 'v4' }),
  length: z.number(),
  name: z.string().trim().min(1, 'no mímino 1 caracter').max(255, 'no máxino 255 caracteres'),
  data: z.string().optional(),
  secret: z.string().min(1, 'no mímino 1 caracter').max(255, 'no máxino 255 caracteres'),
  starred: z.boolean(),
}

type ValidationCtx = {
  isContentNew: boolean,
  currentName?: Content['name'],
}

export function validateContent(content: Partial<Content>, ctx: ValidationCtx) {
  const newSchema = { ...schema }

  newSchema.name = schema.name.refine((name) => {
    const nameInUse = isNameBeenUsed(name as string)
    if (nameInUse && (ctx.isContentNew === true || ctx.isContentNew === false && ctx.currentName !== name)) {
      return false
    }
    return true
  }, { message: 'nome em uso' })

  return z.object(newSchema).safeParse(content)
}

export function validateContentProp<K extends keyof Content>(key: K, value: Content[K], ctx: ValidationCtx) {
  const propSchema = key !== 'name'
    ? schema[key]
    : schema.name.refine((name) => {
      const nameInUse = isNameBeenUsed(name as string)
      if (nameInUse && (ctx.isContentNew === true || ctx.isContentNew === false && ctx.currentName !== name)) {
        return false
      }
      return true
    }, { message: 'nome em uso' })

  return z.object({ [key]: propSchema }).safeParse({ [key]: value })
}
