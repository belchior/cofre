import React from 'react'
import type { ZodSafeParseError } from 'zod'
import type { Content, CustomField } from '../../lib/storage'
import * as clipboard from '../../lib/clipboard'
import { IconCopy, IconMinus, IconStar } from '../Icon/Icon'
import { Checkbox, Input } from '../Input/Input'
import { uniqueId } from '../../lib/crypto'
import { validateContent, validateContentProp, validateField, type Field } from './validation'
import './AddSecret.css'

type CustomFieldProps = {
  notAllowed: string[],
  onSubmit: (_field: Field) => void,
}

function CustomFieldForm(props: CustomFieldProps) {
  const { notAllowed } = props

  const initialValue = { name: '', isSecret: false }
  const [field, setField] = React.useState<Field>(initialValue)
  const [errorMessage, setErrorMessage] = React.useState({ name: '' })
  const inputRef = React.useRef(null)

  const handleChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'isSecret'
      ? event.target.checked
      : event.target.value
    setField(prev => ({ ...prev, [key]: value }))
  }

  const handleInputBlur = () => {
    if (notAllowed.includes(field.name)) {
      setErrorMessage(prev => ({ ...prev, name: 'nome em uso' }))
      return
    }
    const result = validateField(field)
    const message = result.error?.issues.at(0)?.message ?? ''
    setErrorMessage(prev => ({ ...prev, name: message }))
  }

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (notAllowed.includes(field.name)) {
      setErrorMessage(prev => ({ ...prev, name: 'nome em uso' }))
      return
    }

    const result = validateField(field)
    if (result.success === false) {
      const message = result.error?.issues.at(0)?.message
      setErrorMessage(prev => ({ ...prev, name: message }))
      return
    }

    const newField = {
      name: field.name.trim(),
      isSecret: field.isSecret,
    }
    props.onSubmit(newField)
    setField(initialValue);
    (inputRef.current as unknown as HTMLInputElement).focus()
  }

  return (
    <div className='CustomFieldForm'>
      <Input
        className='custom-input'
        label='Novo campo'
        message={errorMessage.name}
        name='custom-input-1'
        onBlur={handleInputBlur}
        onChange={handleChange('name')}
        type='text'
        value={field.name}
        ref={inputRef}
      />

      <Checkbox
        checked={field.isSecret}
        className='custom-checkbox'
        id='custom-checkbox-1'
        label='Segredo'
        name='custom-checkbox-1'
        onChange={handleChange('isSecret')}
        type='checkbox'
      />

      <button type='submit' onClick={handleSubmit}>
        adicionar
      </button>
    </div>
  )
}

type AddSecretForm = HTMLFormElement & {
  readonly elements: HTMLFormControlsCollection & {
    name: HTMLInputElement,
    secret: HTMLInputElement,
    starred: HTMLInputElement,
    customFields: HTMLInputElement[],
  }
}

type FormError = {
  name: string,
  secret: string,
  customFields: string[],
}

type EditProps = {
  content?: Content,
  onCancel: () => void,
  onRemove: () => void,
  onSubmit: (_content: Content) => void,
}

function Edit(props: EditProps) {
  const { content } = props
  const [errorMessage, setErrorMessage] = React.useState<FormError>({ name: '', secret: '', customFields: [] })
  const [favorite, setFavorite] = React.useState(Boolean(content?.starred))
  const [customFields, setCustomField] = React.useState(content?.customFields ?? [])

  const setErrors = (result: ZodSafeParseError<Content>) => {
    const initialValue: FormError = {
      name: '',
      secret: '',
      customFields: [],
    }
    const newError = result.error.issues.reduce((acc, item) => {
      const key = item.path[0] as keyof FormError

      if (item.path.length === 1) {
        (acc[key] as string) = item.message
      }
      if (item.path.length === 3) {
        const index = item.path[1] as number
        (acc[key] as FormError['customFields'])[index] = item.message
      }
      return acc
    }, initialValue)

    setErrorMessage(prev => ({ ...prev, ...newError }))
  }

  const handleAddField = (field: Field) => {
    setCustomField(prev => {
      const newField: CustomField = {
        name: field.name,
        type: field.isSecret ? 'password' : 'text',
        index: customFields.length,
        value: '',
      }
      return [...prev, newField]
    })
  }

  const handleRemoveField = (fieldName: string) => () => {
    setCustomField(prev => prev.filter(item => item.name !== fieldName))
  }

  const handleInputBlur = (event: React.FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.name as keyof Content
    const value = event.currentTarget.value
    const id = event.currentTarget.id

    const ctx = {
      isContentNew: Boolean(content == null),
      currentName: content?.name,
    }

    const message = validateContentProp(name, value, ctx)

    setErrorMessage(prev => {
      if (name === 'customFields') {
        const index = customFields.find(i => i.name === id)?.index ?? -1
        const value = [...errorMessage.customFields]
        value[index] = message

        return { ...prev, [name]: value }
      }

      return { ...prev, [name]: message }
    })
  }

  const handleSubmit = (event: React.FormEvent<AddSecretForm>) => {
    event.preventDefault()
    const id = content?.id ?? uniqueId()
    const name = event.currentTarget.elements.name.value.trim()
    const secret = event.currentTarget.elements.secret.value
    const starred = Boolean(event.currentTarget.elements.starred.defaultChecked)
    const customInputs = event.currentTarget.elements.customFields
    const newCustomFields = []

    if (customInputs instanceof HTMLInputElement) {
      newCustomFields.push({
        type: customInputs.type as CustomField['type'],
        name: customInputs.id,
        value: customInputs.value,
        index: 0,
      })
    }

    if (customInputs instanceof NodeList) {
      for (const [index, item] of customInputs.entries()) {
        newCustomFields.push({
          type: item.type as CustomField['type'],
          name: item.id,
          value: item.value,
          index,
        })
      }
    }

    const newContent: Content = {
      createdAt: new Date().toISOString(),
      customFields: newCustomFields,
      id,
      length: secret.length,
      name,
      secret,
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

    setCustomField(newCustomFields)
    props.onSubmit(newContent)
  }

  const toggleFavorite = () => setFavorite(!favorite)

  const [text, color] = favorite
    ? ['Favorito', 'var(--color-3)']
    : ['Adicionar aos favoritos', undefined]

  const [hasContent, label, submitText] = content
    ? [true, 'Atualizar segredo', 'atualizar']
    : [false, 'Novo segredo', 'adicionar segredo']

  return <>
    <form className='AddSecret' onSubmit={handleSubmit}>
      <header>
        <label>{label}</label>
        {hasContent === true && <>
          <button type='button' className='btn-remove' onClick={props.onRemove}>
            remover
          </button>
        </>}
      </header>

      <div className='edit'>
        <button type='button' className='btn-starred' onClick={toggleFavorite}>
          <IconStar color={color} /> {text}
          <Input
            defaultChecked={favorite}
            hidden
            name='starred'
            type='checkbox'
          />
        </button>

        <Input
          autoComplete='off'
          autoFocus
          className='input-name'
          defaultValue={content?.name}
          id='name'
          label='nome'
          message={errorMessage.name}
          name='name'
          onBlur={handleInputBlur}
          required
          type='text'
        />

        <Input
          className='input-secret'
          defaultValue={content?.secret}
          id='secret'
          label='senha'
          message={errorMessage.secret}
          name='secret'
          onBlur={handleInputBlur}
          required
          type='password'
        />

        {customFields.map((field) => <div className='custom-field-line' key={field.index}>
          <Input
            autoComplete='off'
            className='input-name'
            defaultValue={field.value}
            id={field.name}
            label={field.name}
            message={errorMessage.customFields.at(field.index)}
            name='customFields'
            onBlur={handleInputBlur}
            type={field.type}
          />
          <button
            className='remove-custom-field b-r'
            onClick={handleRemoveField(field.name)}
            title={`remover ${field.name}`}
            type="button"
          >
            <IconMinus />
          </button>
        </div>)}

        <CustomFieldForm
          notAllowed={['name', 'secret', ...customFields.map(i => i.name)]}
          onSubmit={handleAddField}
        />
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

type ViewProps = {
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

  const handleCustomFieldCopy = (index: number) => () => {
    if (typeof content.customFields[index]?.value === 'string') {
      clipboard.writeText(content.customFields[index].value)
    }
  }

  const [text, color] = content.starred
    ? ['Favorito', 'var(--color-3)']
    : ['Adicionar aos favoritos', undefined]

  return <>
    <section className='AddSecret'>
      <header>
        <label>Detalhes de {content.name}</label>
        <button type='button' className='btn-remove' onClick={props.onRemove}>
          remover
        </button>
      </header>

      <div className='view'>
        <span className='btn-starred'>
          <IconStar color={color} /> {text}
        </span>

        <div className='view-line'>
          <Input
            autoComplete='off'
            autoFocus
            className='input-name'
            value={content.name}
            id='name'
            label='nome'
            name='name'
            type='text'
            viewMode
          />
          <div className='actions'>
            <button className='b-r btn-copy' type='button' onClick={handleCopy('name')} title='copiar'>
              <IconCopy />
            </button>
          </div>
        </div>

        <div className='view-line'>
          <Input
            className='input-secret'
            value={content.secret}
            id='secret'
            label='senha'
            name='secret'
            type='password'
            viewMode
          />
          <div className='actions'>
            <button className='b-r btn-copy' type='button' onClick={handleCopy('secret')} title='copiar'>
              <IconCopy />
            </button>
          </div>
        </div>

        {content.customFields.map(field => (
          <div className='view-line' key={field.index}>
            <Input
              className='custom-field'
              value={field.value}
              id={field.name}
              label={field.name}
              name={field.name}
              type={field.type}
              viewMode
            />
            <div className='actions'>
              <button className='b-r btn-copy' type='button' onClick={handleCustomFieldCopy(field.index)} title='copiar'>
                <IconCopy />
              </button>
            </div>
          </div>
        ))}
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

type AddSecretProps = {
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
