import { useState } from 'react'

export function useModal() {
  const [isOpen, setModal] = useState(false)
  const openModal = () => setModal(true)
  const closeModal = () => setModal(false)
  return { isOpen, openModal, closeModal }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useModalContentType<T>(contentTypes: Readonly<T[]>) {
  type Value = typeof contentTypes[number]
  type InitialValue = { open: boolean, contentType?: Value }

  const [modal, setModal] = useState<InitialValue>({ open: false, contentType: undefined })
  const openModal = (contentType: Value) => setModal({ open: true, contentType })
  const closeModal = () => setModal({ open: false, contentType: undefined })
  return { modal, openModal, closeModal }
}
