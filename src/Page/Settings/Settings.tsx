import React from 'react'
import { Link } from 'react-router'
import { invoke } from '@tauri-apps/api/core'
import { AppBackup } from './AppBackup'
import { AppContext } from '../../component/App/AppProvider'
import { BiometricAuth } from '../../component/AuthMethods/BiometricAuth'
import { DangerZone } from './DangerZone'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { Notification } from '../../component/Notification/Notification'
import { PinAuth } from '../../component/AuthMethods/PinAuth'
import { t } from '../../lib/translation'
import { useNotification } from '../../component/Notification/Notification.hook'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'
import * as webauthn from '../../lib/webAuthn'

export function PageSettings() {
  const context = React.use(AppContext)
  const notify = useNotification()
  const [isAutheticatorAvailable, setAutheticator] = React.useState<boolean>()

  const handleChange = async (partSett: Partial<storage.Settings>, partUd: Partial<storage.UserData>) => {
    if (context.sett == null) return
    const enabled = auth.enabledAuthMethod(partSett)
    const mergedSett = {
      ...(enabled !== '' ? auth.disableAuthMethod(context.sett) : context.sett),
      ...partSett,
    }
    const mergedUd = { ...context.ud, ...partUd }

    try {
      await invoke('update_sett_ud', { sett: mergedSett, ud: mergedUd })
      notify.setNotification('success', t('config_updated'))
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : typeof error === 'string' ? error : t('must_choose_auth_method')
      notify.setNotification('error', message)
      console.log(error)
    }
  }

  React.useEffect(() => {
    (async () => {
      const test = await webauthn.isAuthenticatorAvailable()
      if (isAutheticatorAvailable == null) {
        setAutheticator(() => test)
      }
    })()
  })

  if (context.sett == null || context.ud == null) return null

  return <>
    <Header />
    <main className='Settings'>
      <h2>{t('configurations')}</h2>
      <div className='box'>
        <Link to='/cofre/logout' className='button'>App logout</Link>
      </div>
      <div className='glueyBoxes'>
        <PinAuth
          notify={notify}
          onChange={handleChange}
          sett={context.sett}
          ud={context.ud}
        />
        {isAutheticatorAvailable && <>
          <BiometricAuth
            notify={notify}
            onChange={handleChange}
            sett={context.sett}
            ud={context.ud}
          />
        </>}
      </div>
      <AppBackup notify={notify} />
      <DangerZone notify={notify} />
      <div className='actionGroup'>
        <Link to='/cofre/home' className='button'>{t('go_back')}</Link>
      </div>
    </main>
    <Footer />
    <Notification
      message={notify.message}
      onClose={notify.closeNotification}
      type={notify.type}
    />
  </>
}
