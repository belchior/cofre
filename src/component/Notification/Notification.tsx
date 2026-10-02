import React from 'react'
import { createPortal } from 'react-dom'
import { cls } from '../../lib/classNames'
import { t } from '../../lib/translation'
import './Notification.css'

export type NotificationProps = {
  message?: string,
  onClose: () => void,
  open?: boolean,
  timeout?: number,
  type?: 'info' | 'error' | 'success',
}
export function Notification(props: NotificationProps) {
  const { onClose, message = '', open = false, timeout = 30000, type = 'info' } = props

  const classes = cls('Notification', type)

  React.useEffect(() => {
    if (open === false || message == null) return
    const timeoutId = setTimeout(onClose, timeout)
    return () => { clearTimeout(timeoutId) }
  })

  console.log('Notification', open, message)
  if (open === false || message === '') return null

  return createPortal(
    <div className={classes}>
      <div className='content'>
        <p>{message}</p>
        <button type="button" onClick={onClose}>{t('close')}</button>
      </div>
    </div>,
    document.body
  )
}