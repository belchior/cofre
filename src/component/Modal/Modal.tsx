import React, { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

export type ModalProps = {
  children: ReactNode,
  onClose: () => void,
  open?: boolean,
}

export function Modal(props: ModalProps) {
  const { children, open = false, onClose } = props

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEventInit) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  if (open === false) return null

  return createPortal(
    <dialog className="Modal" open={open} onClick={onClose}>
      <div className="content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>,
    document.body
  )
}
