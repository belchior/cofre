import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

export type ModalProps = {
  children: ReactNode,
  onClose: () => void,
  open?: boolean,
}

export function Modal(props: ModalProps) {
  const { children, open = false, onClose } = props

  useEffect(() => {
    const handleEsc = (event: KeyboardEventInit) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)

    if (open && window.innerHeight < document.body.scrollHeight) {
      document.body.classList.add('noscroll')
    }

    return () => {
      window.removeEventListener('keydown', handleEsc)

      if (document.body.getElementsByClassName('Modal').length === 0) {
        document.body.classList.remove('noscroll')
      }
    }
  }, [open, onClose])

  if (open === false) return null

  return createPortal(
    <div className="Modal" onClick={onClose}>
      <div className="content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}
