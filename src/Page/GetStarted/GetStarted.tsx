import React from 'react'
import { useNavigate } from 'react-router'
import { BiometricAuth } from '../Settings/BiometricAuth'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { isSettingsValid } from '../Settings/Settings'
import { Notification } from '../../component/Notification/Notification'
import { PinAuth } from '../Settings/PinAuth'
import { SettingsContext } from '../Settings/SettingsProvider'
import { t } from '../../lib/translation'
import { useNotification } from '../../component/Notification/Notification.hook'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import './GetStarted.css'

export function GetStarted() {
  const context = React.use(SettingsContext)
  const navigate = useNavigate()
  const notify = useNotification()
  const [sett, setSettings] = React.useState(context.settings)
  const [isAutheticatorAvailable, setAutheticator] = React.useState<boolean>()

  const handleChange = async (partialSett: Partial<storage.ISettings>) => {
    setSettings(prevSett => {
      return { ...prevSett, ...partialSett } as storage.ISettings
    })
  }

  const handleSubmit = () => {
    if (sett == null) return
    const [isValid, message] = isSettingsValid(sett)

    if (isValid === false) {
      notify.setNotification('error', message)
      return
    }

    context.saveSettings(sett)
  }

  React.useEffect(() => {
    setSettings(prev => {
      if (context.settings == null) return prev
      return {
        ...context.settings,
        ...prev,
      } as storage.ISettings
    })
  }, [context.settings, setSettings])

  React.useEffect(() => {
    (async () => {
      // If the user has a valid settings and session he should be redirected to home page
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        navigate('/cofre', { replace: true })
        return
      }

      // If the user has a valid settings but has no session he should be redirected to the login page
      const hasValidSettings = [
        context.settings?.enableBiometricAuth,
        context.settings?.enablePinAuth,
      ].includes(true)
      if (hasValidSettings) {
        navigate('/cofre/login', { replace: true })
        return
      }

      const test = await webAuthn.isAuthenticatorAvailable()
      if (isAutheticatorAvailable == null) {
        setAutheticator(() => test)
      }
    })()
  })

  if (sett == null) return null

  return <>
    <main className='GetStarted'>
      <IconLogo />
      <h1>{t('choose_auth_method')}</h1>
      <ul>
        <li className='gluey'>
          <PinAuth
            notify={notify}
            onChange={handleChange}
            sett={sett}
          />
        </li>
        {isAutheticatorAvailable && <>
          <li className='gluey'>
            <BiometricAuth
              notify={notify}
              onChange={handleChange}
              sett={sett}
            />
          </li>
        </>}
      </ul>
      <button type='button' className='saveSettings' onClick={handleSubmit}>{t('next')}</button>
    </main>
    <Footer />
    <Notification
      message={notify.message}
      onClose={notify.closeNotification}
      type={notify.type}
    />
  </>
}