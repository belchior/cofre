import React, { type PropsWithChildren } from 'react'
import * as storage from '../../lib/storage'
import * as cryptoKey from '../../lib/cryptoKey'

export type AppContext = {
  init: boolean,
  sett?: storage.Settings,
  ud?: storage.UserData,
  saveSettings: (sett: storage.Settings) => void,
  saveUserData: (ud: storage.UserData) => void,
  addContent: (contents: storage.Content) => void,
  removeContent: (id: storage.Content['id']) => void,
  updateContent: (id: storage.Content['id'], contents: storage.Content) => void,
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext<AppContext>({
  init: false,
  sett: undefined,
  ud: undefined,
  saveSettings: () => { },
  saveUserData: () => { },
  addContent: () => { },
  removeContent: () => { },
  updateContent: () => { },
})

export function AppProvider(props: PropsWithChildren) {
  const [sett, setSettings] = React.useState<storage.Settings>()
  const [ud, setUserData] = React.useState<storage.UserData>()

  const saveSettings = React.useCallback((newSett: storage.Settings) => {
    setSettings(() => newSett)
  }, [setSettings])

  const saveUserData = React.useCallback((newUd: storage.UserData) => {
    setUserData(prev => ({ ...prev, ...newUd }))
  }, [setUserData])

  const addContent = React.useCallback((content: storage.Content) => {
    if (ud == null) return
    setUserData(prev => ({ ...prev, contents: [...ud.contents, content] }))
  }, [ud, setUserData])

  const removeContent = React.useCallback((id: storage.Content['id']) => {
    if (ud == null) return
    const newContents = ud.contents.filter(item => item.id !== id)
    setUserData(prev => ({ ...prev, contents: newContents }))
  }, [ud, setUserData])

  const updateContent = React.useCallback((id: storage.Content['id'], content: storage.Content) => {
    if (ud == null) return
    const newContents = ud.contents.map(item => item.id === id ? content : item)
    setUserData(prev => ({ ...prev, contents: newContents }))
  }, [ud, setUserData])

  const contextValue = {
    init: sett != null,
    sett: sett,
    ud: ud,
    saveSettings,
    saveUserData,
    addContent,
    removeContent,
    updateContent,
  }

  // Sync Settings with localStorage
  React.useEffect(() => {
    (async () => {
      // load settings from storage or initialize settings config
      if (sett == null) {
        const newSett = await storage.loadSettings()
        setSettings(() => newSett)
        return
      }

      await storage.saveSettings(sett)
    })()
  }, [sett, setSettings])

  // Sync User Data with localStorage
  React.useEffect(() => {
    (async () => {
      const ck = cryptoKey.load()

      // load ud from storage or initialize ud config
      if (ud == null) {
        const ud = await storage.loadUserData(ck)
        setUserData(() => ud)
        return
      }

      await storage.saveUserData(ck, ud)
    })()
  }, [ud, setUserData])

  return (
    <AppContext value={contextValue}>
      {props.children}
    </AppContext>
  )
}