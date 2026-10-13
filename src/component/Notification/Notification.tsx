import React from 'react'
import { createPortal } from 'react-dom'
import { cls } from '../../lib/classNames'
import { t } from '../../lib/translation'
import './Notification.css'

export type NotificationProps = {
  message?: React.ReactNode,
  onClose: () => void,
  timeout?: number,
  type: 'info' | 'error' | 'success',
}
export function Notification(props: NotificationProps) {
  const { onClose, message = '', timeout = 30000, type = 'info' } = props

  const classes = cls('Notification', type)

  React.useEffect(() => {
    if (message === '') return
    const timeoutId = setTimeout(onClose, timeout)
    return () => { clearTimeout(timeoutId) }
  })

  if (message === '') return null

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