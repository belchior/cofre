import React from 'react'
import type { ZodSafeParseError } from 'zod'
import * as clipboard from '../../lib/clipboard'
import type { Content } from '../../lib/storage'
import { IconCopy, IconStar } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { isUniqueId, uniqueId } from '../../lib/crypto'
import { validateContent, validateContentProp } from './validation'
import './AddSecret.css'

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

export type EditProps = {
  content?: Content,
  onCancel: () => void,
  onRemove: () => void,
  onSubmit: (_content: Content) => void,
}

function Edit(props: EditProps) {
  const { content } = props
  const [errorMessage, setErrorMessage] = React.useState<FormError>({ name: '', secret: '' })
  const [favorite, setFavorite] = React.useState(Boolean(content?.starred))

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

  const toggleFavorite = () => setFavorite(!favorite)

  const [text, color] = favorite
    ? ['Favorito', 'var(--color-3)']
    : ['Adicionar aos favoritos', undefined]

  const [hasContent, submitText] = content
    ? [true, 'atualizar']
    : [false, 'adicionar segredo']

  const nameValue = content?.name ?? content?.id
  const secretValue = content?.secret ?? content?.data

  return <>
    <form className='AddSecret' onSubmit={handleSubmit}>
      <header>
        <label className='label'>Novo segredo</label>
        {hasContent === true && <>
          <button type='button' className='btn-remove' onClick={props.onRemove}>
            remover
          </button>
        </>}
      </header>

      <div className='Edit'>
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
          label='senha'
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
      </div>

      <footer>
        <button type='button' className='btn-cancel' onClick={props.onCancel}>
          cancelar
        </button>

        <button type='submit' className='btn-submit'>
          {submitText}
        </button>
      </footer>
    </form>
  </>
}

export type ViewProps = {
  content: Content,
  onCancel: () => void,
  onEdit: () => void,
  onRemove: () => void,
}

function View(props: ViewProps) {
  const { content } = props

  const handleCopy = (key: keyof Content) => () => {
    if (typeof content[key] === 'string') {
      clipboard.writeText(content[key])
    }
  }

  const [text, color] = content.starred
    ? ['Favorito', 'var(--color-3)']
    : ['Adicionar aos favoritos', undefined]

  return <>
    <section className='AddSecret'>
      <header>
        <label className='label'>Segredo de {content.name}</label>
        <button type='button' className='btn-remove' onClick={props.onRemove}>
          remover
        </button>
      </header>

      <div className='View'>
        <Input
          autoComplete='off'
          autoFocus
          className='input-name'
          value={content.name}
          id='name'
          label='nome'
          name='name'
          type='text'
          view
        />

        <div className='actions'>
          <button className='b-r btn-copy' type='button' onClick={handleCopy('name')} title='copiar'>
            <IconCopy />
          </button>
        </div>

        <Input
          className='input-secret'
          value={content.secret}
          id='secret'
          label='senha'
          name='secret'
          type='password'
          view
        />

        <div className='actions'>
          <button className='b-r btn-copy' type='button' onClick={handleCopy('secret')} title='copiar'>
            <IconCopy />
          </button>
        </div>

        <span className='btn-starred'>
          <IconStar color={color} /> {text}
        </span>
      </div>

      <footer>
        <button type='button' className='btn-cancel' onClick={props.onCancel}>
          cancelar
        </button>

        <button type='button' className='btn-edit' onClick={props.onEdit}>
          editar
        </button>
      </footer>
    </section>
  </>
}

export type AddSecretProps = {
  content?: Content,
  onCancel: () => void
  onRemove?: (_content: Content) => void
  onSubmit: (_content: Content) => void
}

export function AddSecret(props: AddSecretProps) {
  const { content } = props
  const [edit, setEdit] = React.useState(content == null)

  const handleCancel = () => props.onCancel && props.onCancel()
  const handleEdit = () => setEdit(!edit)
  const handleRemove = () => {
    if (typeof props.onRemove === 'function' && content) {
      props.onRemove(content)
    }
  }
  const handleSubmit = (newContent: Content) => {
    props.onSubmit(newContent)
  }

  return edit === false && content != null
    ? <View content={content} onCancel={handleCancel} onEdit={handleEdit} onRemove={handleRemove} />
    : <Edit content={content} onCancel={handleCancel} onRemove={handleRemove} onSubmit={handleSubmit} />
}
