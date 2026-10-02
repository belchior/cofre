import React from 'react'
import type { NotificationProps } from './Notification'

export type NotifyState = {
  isOpen: boolean,
  message: string,
  type: NotificationProps['type'],
}
export type Notify = NotifyState & {
  closeNotification: () => void
  setNotification: React.Dispatch<React.SetStateAction<NotifyState>>
}

export function useNotification(): Notify {
  const [state, setNotification] = React.useState<NotifyState>({
    isOpen: false,
    message: '',
    type: 'info',
  })

  const closeNotification = () => setNotification(prev => ({
    ...prev,
    message: '',
    isOpen: false,
  }))

  return {
    isOpen: state?.isOpen,
    message: state?.message,
    type: state?.type,
    setNotification,
    closeNotification,
  }
}