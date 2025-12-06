import React, { type PropsWithChildren } from 'react'
import * as storage from '../../lib/storage'

type SettingsContext = {
  init: boolean,
  settings?: storage.ISettings,
  // eslint-disable-next-line no-unused-vars
  saveSettings: (sett: storage.ISettings) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = React.createContext<SettingsContext>({
  init: false,
  settings: undefined,
  saveSettings: () => { },
})

export function SettingsProvider(props: PropsWithChildren) {
  const [sett, setSettings] = React.useState<storage.ISettings>()

  const saveSettings = React.useCallback((newSett: storage.ISettings) => {
    setSettings(() => newSett)
  }, [setSettings])

  const contextValue = {
    init: sett != null,
    settings: sett,
    saveSettings,
  }

  React.useEffect(() => {
    // initialize settings config
    if (sett == null) {
      (async () => {
        const newSett = await storage.loadSettings()
        setSettings(() => newSett)
      })()
      return
    }

    // keep settings in sync with the storage
    if (sett != null) {
      (async () => {
        await storage.saveSettings(sett)
      })()
      return
    }
  }, [sett])

  return (
    <SettingsContext value={contextValue}>
      {props.children}
    </SettingsContext>
  )
}