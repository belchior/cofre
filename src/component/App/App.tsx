import React from 'react'
import { ContentContext } from '../ContentProvider/ContentProvider'
import { List } from '../List/List'
import { Input } from '../Input/Input'
import { IconAddSecret, IconGear, IconSearch } from '../Icon/Icon'
import type { Content } from '../../lib/data-layer'
import './App.css'
import { Modal } from '../Modal/Modal'
import { useModal } from '../Modal/Modal.hook'
import { AddSecret } from '../AddSecret/AddSecret'

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
    ? contents.filter((item) => item.id.includes(textSearch))
    : contents

  filteredContent.sort((a, b) => {
    if (a.starred !== b.starred) {
      if (a.starred) return -1
      if (b.starred) return 1
    }
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1
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
    </>
  )
}

export default App
