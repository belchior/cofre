import React from 'react'
import type { Content } from '../../lib/storage'
import { IconStar } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { isUniqueId, uniqueId } from '../../lib/crypto'
import { validateContent, validateContentProp } from './validation'
import './AddSecret.css'
import type { ZodSafeParseError } from 'zod'

export type AddSecretProps = {
  content?: Content,
  onCancel?: () => void
  onRemove?: (_content: Content) => void
  onSubmit: (_content: Content) => void
}

type AddSecretForm = HTMLFormElement & {
  readonly elements: HTMLFormControlsCollection & {
    name: HTMLInputElement,
    secret: HTMLInputElement,
    starred: HTMLInputElement,
  }
}

type FormError = {
  name: Content['name'],
  secret: Content['secret'],
}

export function AddSecret(props: AddSecretProps) {
  const { content } = props
  const [favorite, setFavorite] = React.useState(Boolean(content?.starred))
  const [errorMessage, setErrorMessage] = React.useState<FormError>({ name: '', secret: '' })

  const setErrors = (result: ZodSafeParseError<Partial<FormError>>) => {
    const newError = result.error.issues.reduce((acc, item) => {
      if (item.path.length > 0) {
        const key = item.path[0] as keyof FormError
        acc[key] = item.message
      }
      return acc
    }, {} as Partial<FormError>)

    setErrorMessage(prev => ({ ...prev, ...newError }))
  }
  const handleCancel = () => props.onCancel && props.onCancel()
  const handleInputBlur = (event: React.FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.name as keyof Content
    const value = event.currentTarget.value

    const ctx = {
      isContentNew: Boolean(content == null),
      currentName: content?.name,
    }
    const result = validateContentProp(name, value, ctx)

    if (result.success) setErrorMessage(prev => ({ ...prev, [name]: '' }))
    else setErrors(result)
  }
  const handleRemove = () => {
    if (typeof props.onRemove === 'function' && content) {
      props.onRemove(content)
    }
  }
  const handleSubmit = (event: React.FormEvent<AddSecretForm>) => {
    event.preventDefault()
    const id = content && isUniqueId(content.id) ? content.id : uniqueId()
    const name = event.currentTarget.elements.name.value
    const secret = event.currentTarget.elements.secret.value
    const starred = Boolean(event.currentTarget.elements.starred.defaultChecked)

    const newContent: Content = {
      data: undefined,
      createdAt: new Date().toISOString(),
      secret,
      id,
      name,
      length: secret.length,
      starred,
    }

    const ctx = {
      isContentNew: Boolean(content == null),
      currentName: content?.name,
    }
    const result = validateContent(newContent, ctx)

    if (result.success === false) {
      setErrors(result)
      return
    }

    props.onSubmit(newContent)
  }
  const toggleFavorite = () => setFavorite(!favorite)

  const [text, color] = favorite
    ? ['Favorito', 'var(--color-3)']
    : ['Adicionar aos favoritos', undefined]

  const [hasContent, label, submitText] = content
    ? [true, 'Atualizar conteúdo', 'atualizar']
    : [false, 'Nova senha', 'adicionar senha']

  const nameValue = content?.name ?? content?.id
  const secretValue = content?.secret ?? content?.data

  return (
    <form className='AddSecret' onSubmit={handleSubmit}>
      <label className='label'>{label}</label>

      {hasContent === true && <>
        <button type='button' className='btn-remove' onClick={handleRemove}>
          remover conteúdo
        </button>
      </>}

      <Input
        autoComplete='off'
        autoFocus
        className='input-name'
        defaultValue={nameValue}
        id='name'
        label='nome'
        name='name'
        type='text'
        message={errorMessage.name}
        onBlur={handleInputBlur}
      />
      <Input
        className='input-secret'
        defaultValue={secretValue}
        id='secret'
        label='segredo'
        name='secret'
        type='password'
        message={errorMessage.secret}
        onBlur={handleInputBlur}
      />

      <button type='button' className='btn-starred' onClick={toggleFavorite}>
        <IconStar color={color} /> {text}
        <Input
          type='checkbox'
          name='starred'
          hidden
          defaultChecked={favorite}
        />
      </button>

      <button type='button' className='btn-cancel' onClick={handleCancel}>
        cancelar
      </button>

      <button type='submit' className='btn-submit'>
        {submitText}
      </button>
    </form>
  )
}
