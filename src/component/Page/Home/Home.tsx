import React from 'react'
import type { Content } from '../../../lib/storage'
import { AddSecret } from '../../AddSecret/AddSecret'
import { ContentContext } from '../../Provider/ContentProvider'
import { Footer } from '../../App/Footer'
import { Header } from '../../App/Header'
import { IconAdd, IconSearch } from '../../Icon/Icon'
import { Input } from '../../Input/Input'
import { List } from '../../List/List'
import { Modal } from '../../Modal/Modal'
import { useModal } from '../../Modal/Modal.hook'
import './Home.css'

export function Home() {
  const { contents, addContent } = React.use(ContentContext)
  const [textSearch, changeTextSearch] = React.useState('')
  const { isOpen, openModal, closeModal } = useModal()

  const handleTextSearch = (item: React.ChangeEvent<HTMLInputElement>) => {
    const text = item.currentTarget.value
    changeTextSearch(text)
  }

  const handleSubmit = (content: Content) => {
    addContent(content)
    closeModal()
  }

  const filteredContent = textSearch !== ''
    ? contents.filter((item) => item.name.toLowerCase().includes(textSearch.toLowerCase()))
    : contents

  filteredContent.sort((a, b) => {
    if (a.starred !== b.starred) {
      if (a.starred) return -1
      if (b.starred) return 1
    }
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })

  return (
    <>
      <Header />

      <menu className='Menu'>
        <li>
          <Input
            autoComplete='off'
            autoFocus
            icon={<IconSearch />}
            onChange={handleTextSearch}
            title='Busque segredos por nome'
          />
        </li>
        <li className='actions'>
          <button type="button" onClick={openModal} title='adicionar segredo'>
            <IconAdd /> Adicionar segredo
          </button>
        </li>
      </menu>

      <main className='Main'>
        <List items={filteredContent} />
      </main>

      <Modal open={isOpen} onClose={closeModal}>
        <AddSecret onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>

      <Footer />
    </>
  )
}
