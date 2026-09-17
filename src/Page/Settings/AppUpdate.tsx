import React from 'react'
import { Switch } from '../../component/Input'
import * as storage from '../../lib/storage'

function hasUpdate(arg?: storage.AppVersions) {
  if (arg == null) return false
  const v = Number(arg.version.replaceAll('.', ''))
  const lv = Number(arg.lastVersion.replaceAll('.', ''))
  return lv > v
}

/**
 * Should be use in a React.useEffect context
*/
// eslint-disable-next-line react-refresh/only-export-components
export function updateAppVersionIfNeed(sett: storage.ISettings) {
  if (sett.enableAutoUpdate === false) return
  const versions = storage.loadVersions()
  if (hasUpdate(versions) === false) return
  console.debug(`The App will be updated from ${versions.version} to ${versions.lastVersion}`)
  storage.updateVersions(versions)
  window.location.assign('/cofre')
}

type AppUpdateProps = {
  sett: storage.ISettings
  onChange: (data: Partial<storage.ISettings>) => void
}
export function AppUpdate(props: AppUpdateProps) {
  const [state, setState] = React.useState<storage.AppVersions>()

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    if (elem.name !== 'enableAutoUpdate') return

    const sett: Partial<storage.ISettings> = {
      enableAutoUpdate: elem.checked,
    }
    props.onChange(sett)
  }

  const handleClickUpdate = () => {
    if (state == null) return
    window.localStorage.setItem('version', state.lastVersion)
    window.location.assign('/cofre')
  }

  React.useEffect(() => {
    setState(prev => {
      if (prev != null) return prev
      return storage.loadVersions()
    })
  }, [setState])

  const showLastUpdate = props.sett.enableAutoUpdate === false && hasUpdate(state)

  return <>
    <h3>Atualização da app</h3>
    <p>
      Receber atualizações de forma automática
    </p>
    <Switch
      name='enableAutoUpdate'
      onChange={handleSwitchChange}
      defaultChecked={props.sett.enableAutoUpdate}
    />

    <div>
      {state?.version && <span><br />Versão atual <span className='marked'>{state.version}</span></span>}
      {showLastUpdate && <>
        <br /><br />
        Há uma versão mais recente, deseja atualizar? <button type='button' onClick={handleClickUpdate}>sim, quero atualizar</button>
      </>}
    </div>
  </>
}