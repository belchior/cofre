import React, { type PropsWithChildren } from 'react'
import * as storage from '../../lib/storage'

export type SettingsContext = {
  init: boolean,
  settings?: storage.ISettings,
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
    // load settings from storage or initialize settings config
    if (sett == null) {
      (async () => {
        const newSett = await storage.loadSettings()
        setSettings(() => newSett)
      })()
      return
    }

    // keep settings in sync with the storage
    (async () => {
      await storage.saveSettings(sett)
    })()
  }, [sett])

  return (
    <SettingsContext value={contextValue}>
      {props.children}
    </SettingsContext>
  )
}