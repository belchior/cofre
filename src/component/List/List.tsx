import React from 'react'
import { ContentContext } from '../ContentProvider/ContentProvider'
import { cls } from '../../lib/classNames'
import { IconMenu } from '../Icon/Icon'
import type { Content } from '../../lib/dataLayer'
import { useModal } from '../Modal/Modal.hook'
import { AddSecret } from '../AddSecret/AddSecret'
import { Modal } from '../Modal/Modal'
import './List.css'

type ItemProps = {
  value: Content,
}

function Item(props: ItemProps) {
  const { value: content } = props
  const [show, setShowValue] = React.useState(false)
  const { isOpen, openModal, closeModal } = useModal()
  const { updateContent, removeContent } = React.useContext(ContentContext)

  const handleSubmit = (newContent: Content) => {
    updateContent(content.id, newContent)
    closeModal()
  }

  const handleRemove = (newContent: Content) => {
    removeContent(newContent.id)
  }

  const toggleShow = () => setShowValue(!show)

  const classes = cls('Item', [content.starred, 'starred'])
  const nameValue = content.name ?? content.id
  const secretValue = content.secret ?? content.data

  const [text, value, classNameContent] = show
    ? ['hide', secretValue, 'show-value']
    : ['show', secretValue.replaceAll(/./g, '*'), '']

  return <>
    <li className={classes}>
      <button className='star' type="button" onClick={openModal}>
        <IconMenu />
      </button>
      <span className={`content ${classNameContent}`}>
        <span className='name'>{nameValue}</span>
        <span className='value'>{value}</span>
      </span>
      <button className='show' type='button' onClick={toggleShow}>
        {text}
      </button>
    </li>

    <Modal open={isOpen} onClose={closeModal}>
      <AddSecret content={content} onSubmit={handleSubmit} onRemove={handleRemove} />
    </Modal>
  </>
}

type ListProps = {
  items: Content[],
}
export function List(props: ListProps) {
  const { items } = props

  return <>
    <ul className='List'>
      {items.map((item) => <Item key={item.id} value={item} />)}
    </ul>
  </>
}
