import React, { type PropsWithChildren } from 'react'
import { invoke } from '@tauri-apps/api/core'
import * as storage from '../../lib/storage'

export type AppContext = {
  init: boolean,
  sett?: storage.Settings,
  content?: storage.Content[],
  ud?: storage.UserData,
  saveSettings: (sett: storage.Settings) => void,
  addContentItem: (contents: storage.Content) => void,
  removeContentItem: (id: storage.Content['id']) => void,
  updateContentItem: (id: storage.Content['id'], contents: storage.Content) => void,
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext<AppContext>({
  init: false,
  sett: undefined,
  content: undefined,
  ud: undefined,
  saveSettings: () => { },
  addContentItem: () => { },
  removeContentItem: () => { },
  updateContentItem: () => { },
})

export function AppProvider(props: PropsWithChildren) {
  const [sett, setSettings] = React.useState<storage.Settings>()
  const [content, setContent] = React.useState<storage.Content[]>()
  const [ud, setUserData] = React.useState<storage.UserData>()

  const saveSettings = React.useCallback((newSett: storage.Settings) => {
    setSettings(() => newSett)
  }, [setSettings])

  const addContentItem = React.useCallback((contentItem: storage.Content) => {
    if (content == null) return
    setContent(prev => {
      if (prev == null) return prev
      return [...prev, contentItem]
    })
  }, [content, setContent])

  const removeContentItem = React.useCallback((id: storage.Content['id']) => {
    if (content == null) return
    const newContent = content.filter(item => item.id !== id)
    setContent(() => newContent)
  }, [content, setContent])

  const updateContentItem = React.useCallback((id: storage.Content['id'], contentItem: storage.Content) => {
    if (content == null) return
    const newContent = content.map(item => item.id === id ? contentItem : item)
    setContent(() => newContent)
  }, [content, setContent])

  const contextValue = {
    init: sett != null,
    sett: sett,
    content: content,
    ud: ud,
    saveSettings,
    addContentItem,
    removeContentItem,
    updateContentItem,
  }

  // Sync Settings with storage
  React.useEffect(() => {
    (async () => {
      // load settings from storage or initialize settings config
      if (sett == null) {
        const text = await invoke<string>('load_settings')
        const newSett: storage.Settings = JSON.parse(text)
        setSettings(() => newSett)
        return
      }

      await invoke('save_settings', { sett })
    })()
  }, [sett, setSettings])

  // Sync User Content with storage
  React.useEffect(() => {
    (async () => {
      // load ud from storage or initialize ud config
      if (content == null) {
        const text = await invoke<string>('load_user_content')
        const newContent: storage.Content[] = JSON.parse(text)
        setContent(() => newContent)
        return
      }
      await invoke('save_user_content', { userContent: content })
    })()
  }, [content, setContent])

  // load ud from storage
  React.useEffect(() => {
    (async () => {
      if (ud == null) {
        const text = await invoke<string>('load_user_data')
        const newUd: storage.UserData = JSON.parse(text)
        setUserData(() => newUd)
        return
      }
    })()
  }, [ud, setUserData])

  return (
    <AppContext value={contextValue}>
      {props.children}
    </AppContext>
  )
}
