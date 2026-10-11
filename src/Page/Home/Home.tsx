import React from 'react'
import { AddSecret } from './AddSecret/AddSecret'
import { AppContext } from '../../component/App/AppProvider'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { IconAdd, IconSearch } from '../../component/Icon/Icon'
import { Input } from '../../component/Input/Input'
import { List } from './List/List'
import { Modal } from '../../component/Modal/Modal'
import { t } from '../../lib/translation'
import { useModal } from '../../component/Modal/Modal.hook'
import type { Content } from '../../lib/storage'
import './Home.css'

export function Home() {
  const context = React.use(AppContext)
  const [textSearch, changeTextSearch] = React.useState('')
  const { isOpen, openModal, closeModal } = useModal()

  const handleTextSearch = (item: React.ChangeEvent<HTMLInputElement>) => {
    const text = item.currentTarget.value
    changeTextSearch(text)
  }

  const handleSubmit = (content: Content) => {
    context.addContent(content)
    closeModal()
  }

  if (context.ud == null) {
    return
  }

  const filteredContent = textSearch !== ''
    ? context.ud.contents.filter((item) => item.name.toLowerCase().includes(textSearch.toLowerCase()))
    : [...context.ud.contents]

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
            name='search'
            autoComplete='off'
            autoFocus
            icon={<IconSearch />}
            onChange={handleTextSearch}
            title={t('search_secrets_by_name')}
          />
        </li>
        <li className='actions'>
          <button type="button" onClick={openModal} title={t('add_secret')}>
            <IconAdd /> {t('add_secret')}
          </button>
        </li>
      </menu>
      <main className='Home'>
        <List items={filteredContent} />
      </main>
      <Modal open={isOpen} onClose={closeModal}>
        <AddSecret onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
      <Footer />
    </>
  )
}
