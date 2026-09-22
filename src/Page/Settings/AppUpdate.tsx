import React from 'react'
import { Switch } from '../../component/Input'
import { t } from '../../lib/translation'
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
    <div className='gluey'>
      <Switch
        defaultChecked={props.sett.enableAutoUpdate}
        description={t('receive_updates_auto')}
        name='enableAutoUpdate'
        onChange={handleSwitchChange}
        title={t('app_updates')}
      />
    </div>

    {state?.version && <>
      <div className='gluey'>
        <p>{t('current_version')} <span className='marked'>{state.version}</span></p>
      </div>
    </>}

    {showLastUpdate && <>
      <div className='gluey'>
        <p>{t('new_version_available')}</p>
        <button type='button' onClick={handleClickUpdate}>{t('yes_update')}</button>
      </div>
    </>}
  </>
}