import React from 'react'
import type { NotificationProps } from './Notification'

export type NotifyState = {
  message: NotificationProps['message'],
  type: NotificationProps['type'],
}
export type Notify = NotifyState & {
  closeNotification: () => void
  setNotification: (type: NotifyState['type'], message: NotifyState['message']) => void
}

export function useNotification(): Notify {
  const [state, setState] = React.useState<NotifyState>({
    message: '',
    type: 'info',
  })

  const closeNotification = () => setState(prev => ({ ...prev, message: '' }))

  const setNotification = (type: NotifyState['type'], message: NotifyState['message']) => {
    setState(prev => ({ ...prev, type, message }))
  }

  return {
    message: state?.message,
    type: state?.type,
    setNotification,
    closeNotification,
  }
}