import React from 'react'
import type { Content } from '../../lib/dataLayer'
import { IconAddSecret, IconStar } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { isUniqueId, uniqueId } from '../../lib/crypto'
import './AddSecret.css'

export type AddSecretProps = {
  content?: Content,
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

export function AddSecret(props: AddSecretProps) {
  const { content } = props
  const [favorite, setFavorite] = React.useState(Boolean(content?.starred))

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

    props.onSubmit(newContent)
  }

  const handleRemove = () => {
    if (typeof props.onRemove === 'function' && content) {
      props.onRemove(content)
    }
  }

  const toggleFavorite = () => setFavorite(!favorite)

  const [text, color] = favorite
    ? ['Favorito', 'var(--color-3)']
    : ['Adicionar as favoritos', undefined]

  const [hasContent, label, submitText] = content
    ? [true, 'Atualizar senha', 'atualizar senha']
    : [false, 'Nova senha', 'adicionar senha']

  const nameValue = content?.name ?? content?.id
  const secretValue = content?.secret ?? content?.data

  return (
    <form className='AddSecret' onSubmit={handleSubmit}>
      <label className='label'>{label}</label>
      <Input
        autoComplete='off'
        autoFocus
        className='input-name'
        defaultValue={nameValue}
        id='name'
        label='name'
        name='name'
        type='text'
      />
      <Input
        className='input-secret'
        defaultValue={secretValue}
        id='secret'
        label='secret'
        name='secret'
        type='password'
      />

      <button type='button' className='add-favorite' onClick={toggleFavorite}>
        <IconStar color={color} /> {text}
        <Input
          type='checkbox'
          name='starred'
          hidden
          defaultChecked={favorite}
        />
      </button>

      {hasContent === true && <>
        <button type='button' className='remove-secret' onClick={handleRemove}>
          remover senha
        </button>

        <button type='submit' className='add-secret'>
          {submitText}
        </button>
      </>}

      {hasContent === false && <>
        <button type='submit' className='add-secret'>
          <IconAddSecret /> {submitText}
        </button>
      </>}
    </form>
  )
}
