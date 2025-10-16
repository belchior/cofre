import React from 'react'
import type { Content } from '../../lib/dataLayer'
import { AddSecret } from '../AddSecret/AddSecret'
import { ContentContext } from '../ContentProvider/ContentProvider'
import { IconAddSecret, IconGear, IconSearch } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { List } from '../List/List'
import { Modal } from '../Modal/Modal'
import { useModal } from '../Modal/Modal.hook'
import './App.css'

function App() {
  const { contents, addContent } = React.useContext(ContentContext)
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
      <header className='Header'>
        <h1>Cofre</h1>
        <button type="button" className='b-r'>
          <IconGear />
        </button>
      </header>

      <menu className='Menu'>
        <li>
          <Input icon={<IconSearch />} onChange={handleTextSearch} autoFocus autoComplete='off' />
        </li>
        <li className='actions'>
          <button type="button" onClick={openModal}>
            <IconAddSecret /> Adicionar senha
          </button>
        </li>
      </menu>

      <main className='Main'>
        <List items={filteredContent} />
      </main>

      <Modal open={isOpen} onClose={closeModal}>
        <AddSecret onSubmit={handleSubmit} />
      </Modal>

      <footer className='Footer'>
        <span className='version'>v0.1.1</span>
      </footer>
    </>
  )
}

export default App
