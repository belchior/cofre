import React from 'react'
import type { Content } from '../../lib/storage'
import { AddSecret } from '../AddSecret/AddSecret'
import { ContentContext } from '../ContentProvider/ContentProvider'
import { IconMenu } from '../Icon/Icon'
import { Modal } from '../Modal/Modal'
import { cls } from '../../lib/classNames'
import { useModal } from '../Modal/Modal.hook'
import * as clipboard from '../../lib/clipboard'
import './List.css'

type ItemProps = {
  copied: boolean,
  onCopy: () => void,
  content: Content,
}

function Item(props: ItemProps) {
  const { copied, content, onCopy } = props
  const [show, setShowValue] = React.useState(false)
  const { isOpen, openModal, closeModal } = useModal()
  const { updateContent, removeContent } = React.useContext(ContentContext)

  const handleContent = () => {
    clipboard.writeText(content.secret)
    onCopy()
  }
  const handleSubmit = (newContent: Content) => {
    updateContent(content.id, newContent)
    closeModal()
  }
  const handleRemove = (newContent: Content) => {
    removeContent(newContent.id)
  }
  const toggleShow = () => setShowValue(!show)

  const classes = cls('Item', [content.starred, 'starred'])
  const classesContent = cls('content', [show, 'show-value'])
  const nameValue = content.name ?? content.id
  const secretValue = content.secret ?? content.data

  const [text, value] = show
    ? ['esconder', secretValue]
    : ['mostrar', secretValue.replaceAll(/./g, '*')]

  return <>
    <li className={classes}>
      <button className='star' type="button" onClick={openModal}>
        <IconMenu />
      </button>
      <button className={classesContent} type='button' onClick={handleContent}>
        <span className='name'>{nameValue}</span>
        <span className='secret'>{value}</span>
        {copied && <span className='copied'>copiado</span>}
      </button>
      <button className='show' type='button' onClick={toggleShow}>
        {text}
      </button>
    </li>

    <Modal open={isOpen} onClose={closeModal}>
      <AddSecret
        content={content}
        onCancel={closeModal}
        onRemove={handleRemove}
        onSubmit={handleSubmit}
      />
    </Modal>
  </>
}

type ListProps = {
  items: Content[],
}
export function List(props: ListProps) {
  const { items } = props
  const [copiedId, setCopied] = React.useState('')

  return <>
    <ul className='List'>
      {items.map((item) => (
        <Item
          key={item.id}
          content={item}
          copied={item.id === copiedId}
          onCopy={() => setCopied(item.id)}
        />
      ))}
    </ul>
  </>
}
