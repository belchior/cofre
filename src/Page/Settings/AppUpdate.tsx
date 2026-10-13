import React from 'react'
import { Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import * as appManager from '../../lib/appManager'
import * as storage from '../../lib/storage'

type AppUpdateProps = {
  sett: storage.Settings,
  ud: storage.UserData,
  onChange: (sett: Partial<storage.Settings>, ud: Partial<storage.UserData>) => void
}
export function AppUpdate(props: AppUpdateProps) {
  const [state, setState] = React.useState<storage.AppVersions>()

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    if (elem.name !== 'enableAutoUpdate') return

    const sett: Partial<storage.Settings> = {
      enableAutoUpdate: elem.checked,
    }
    props.onChange(sett, props.ud)
  }

  const handleClickUpdate = async () => {
    if (state == null) return
    await appManager.updateAppVersion(state)
    window.location.assign('/cofre/login')
  }

  React.useEffect(() => {
    setState(prev => {
      if (prev != null) return prev
      return storage.loadVersions()
    })
  }, [setState])

  const showLastUpdate = props.sett.enableAutoUpdate === false && appManager.hasUpdate(state)

  return <div className='glueyBoxes'>
    <div className='box'>
      <Switch
        defaultChecked={props.sett.enableAutoUpdate}
        description={t('receive_updates_auto')}
        name='enableAutoUpdate'
        onChange={handleSwitchChange}
        title={t('app_updates')}
      />
    </div>

    <div className='box'>
      {state?.version && (
        <p>{t('current_version')} <span className='marked'>{state.version}</span></p>
      )}
      {showLastUpdate && <>
        <p>{t('new_version_available')}</p>
        <button type='button' onClick={handleClickUpdate}>{t('yes_update')}</button>
      </>}
    </div>
  </div>
}