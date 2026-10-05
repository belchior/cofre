import React from 'react'
import { Link } from 'react-router'
import { AppBackup } from './AppBackup'
import { DangerZone } from './DangerZone'
import { AppUpdate } from './AppUpdate'
import { BiometricAuth } from './BiometricAuth'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { Notification } from '../../component/Notification/Notification'
import { PinAuth } from './PinAuth'
import { SettingsContext } from './SettingsProvider'
import { t } from '../../lib/translation'
import { useNotification } from '../../component/Notification/Notification.hook'
import * as storage from '../../lib/storage'
import * as webauthn from '../../lib/webAuthn'

// eslint-disable-next-line react-refresh/only-export-components
export function isSettingsValid(sett: Partial<storage.ISettings>): [boolean, string] {
  const selectedAuthMethod = [sett?.enableBiometricAuth, sett?.enablePinAuth].includes(true)

  if (selectedAuthMethod === false) return [false, t('must_choose_auth_method')]
  if (sett.enableBiometricAuth && sett.passKey == null) return [false, t('passkey_is_required')]
  if (sett.enablePinAuth && (sett.pin == null || sett.pin === '')) return [false, t('pin_is_required')]

  return [true, 'settings valid']
}

export function Settings() {
  const context = React.use(SettingsContext)
  const notify = useNotification()
  const [isAutheticatorAvailable, setAutheticator] = React.useState<boolean>()

  const handleChange = (partialSett: Partial<storage.ISettings>) => {
    const mergedSett = { ...context.settings, ...partialSett }
    const [isValid, message] = isSettingsValid(mergedSett)

    if (isValid === false) {
      notify.setNotification('error', message)
      return
    }

    notify.setNotification('success', t('config_updated'))
    context.saveSettings(mergedSett as storage.ISettings)
  }

  React.useEffect(() => {
    (async () => {
      const test = await webauthn.isAuthenticatorAvailable()
      if (isAutheticatorAvailable == null) {
        setAutheticator(() => test)
      }
    })()
  })

  if (context.settings == null) return null

  return <>
    <Header />
    <main className='Settings'>
      <h2>{t('configurations')}</h2>
      <ul className='box'>
        <li className='gluey pd'>
          <PinAuth onChange={handleChange} sett={context.settings} notify={notify} />
        </li>
        {isAutheticatorAvailable && <>
          <li className='gluey pd'>
            <BiometricAuth onChange={handleChange} sett={context.settings} notify={notify} />
          </li>
        </>}
      </ul>
      <ul className='box'>
        <li>
          <AppUpdate onChange={handleChange} sett={context.settings} />
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
