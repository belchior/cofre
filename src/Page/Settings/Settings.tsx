import React from 'react'
import { Link } from 'react-router'
import { AppBackup } from './AppBackup'
import { AppContext } from '../../component/App/AppProvider'
import { AppUpdate } from './AppUpdate'
import { BiometricAuth } from './BiometricAuth'
import { DangerZone } from './DangerZone'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { Notification } from '../../component/Notification/Notification'
import { PinAuth } from './PinAuth'
import { t } from '../../lib/translation'
import { useNotification } from '../../component/Notification/Notification.hook'
import * as auth from '../../lib/auth'
import * as cryptoKey from '../../lib/cryptoKey'
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

    const [isValid, message] = storage.isSettingsValid(mergedSett)
    if (isValid === false) {
      notify.setNotification('error', message)
      return
    }

    if (cryptoKey.hasChange(mergedSett, mergedUd, context)) {
      await cryptoKey.override(mergedSett as storage.Settings, mergedUd as storage.UserData)
      await auth.addSession()
    }
    context.saveSettings(mergedSett as storage.Settings)
    context.saveUserData(mergedUd as storage.UserData)
    notify.setNotification('success', t('config_updated'))
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
      <ul className='box'>
        <li className='gluey pd'>
          <PinAuth
            notify={notify}
            onChange={handleChange}
            sett={context.sett}
            ud={context.ud}
          />
        </li>
        {isAutheticatorAvailable && <>
          <li className='gluey pd'>
            <BiometricAuth
              notify={notify}
              onChange={handleChange}
              sett={context.sett}
              ud={context.ud}
            />
          </li>
        </>}
      </ul>
      <ul className='box'>
        <li>
          <AppUpdate
            onChange={handleChange}
            sett={context.sett}
            ud={context.ud}
          />
        </li>
      </ul>
      <ul className='box'>
        <li className='gluey pd'>
          <AppBackup notify={notify} />
        </li>
      </ul>
      <ul className='box danger'>
        <li className='gluey pd'>
          <DangerZone notify={notify} />
        </li>
      </ul>
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

