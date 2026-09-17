import React from 'react'
import { AddSecret } from '../AddSecret/AddSecret'
import { cls } from '../../lib/classNames'
import { ContentContext } from '../Provider/ContentProvider'
import { IconMenu } from '../Icon/Icon'
import { Modal } from '../Modal/Modal'
import { t } from '../../lib/translation'
import { useModal } from '../Modal/Modal.hook'
import * as clipboard from '../../lib/clipboard'
import type { Content } from '../../lib/storage'
import './List.css'

type ItemProps = {
  copied: boolean,
  onCopy: () => void,
  content: Content,
}

function Item(props: ItemProps) {
  const { copied, content, onCopy } = props

  const [show, setShow] = React.useState(false)
  const { isOpen, openModal, closeModal } = useModal()
  const { removeContent, updateContent } = React.use(ContentContext)

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
  const toggleShow = () => setShow(!show)

  const classes = cls('Item', [content.starred, 'starred'])
  const classesContent = cls('content', [show, 'showing'])
  const [text, value] = show
    ? [t('hide'), content.secret]
    : [t('show'), '*'.repeat(content.length)]

  return <>
    <li className={classes}>
      <button className='menu' type="button" onClick={openModal} title={t('item_menu')}>
        <IconMenu />
      </button>
      <button className={classesContent} type='button' onClick={handleContent} title={t('click_for_copy_secret')}>
        <span className='name'>{content.name}</span>
        <span className='secret'>{value}</span>
        {copied && <span className='copied'>{t('copied')}</span>}
      </button>
      <button className='show' type='button' onClick={toggleShow} title={`${t('click_for')} ${text} ${t('the_secret')}`}>
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
