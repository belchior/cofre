import React from 'react'
import { useNavigate } from 'react-router'
import { BiometricAuth } from '../Settings/BiometricAuth'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { PinAuth } from '../Settings/PinAuth'
import { SettingsContext } from '../Settings/SettingsProvider'
import { t } from '../../lib/translation'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'
import * as webauthn from '../../lib/webauthn'
import './GetStarted.css'

export function GetStarted() {
  const context = React.use(SettingsContext)
  const navigate = useNavigate()
  const [sett, setSettings] = React.useState(context.settings)
  const [message, setMessage] = React.useState<string>()
  const [isAutheticatorAvailable, setAutheticator] = React.useState<boolean>()

  const handleChange = async (partialSett: Partial<storage.ISettings>) => {
    setSettings(prevSett => {
      return { ...prevSett, ...partialSett } as storage.ISettings
    })
  }

  const handleSubmit = () => {
    const selectedAuthMethod = [sett?.enableBiometricAuth, sett?.enablePinAuth].includes(true)
    if (sett == null || selectedAuthMethod === false) {
      setMessage(() => t('choose_auth_method'))
      return
    }
    if (sett.enableBiometricAuth && sett.passKey == null) {
      setMessage(() => t('passkey_is_required'))
      return
    }
    if (sett.enablePinAuth && (sett.pin == null || sett.pin === '')) {
      setMessage(() => t('pin_is_required'))
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

      const test = await webauthn.isAuthenticatorAvailable()
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
          <PinAuth onChange={handleChange} sett={sett} />
        </li>
        {isAutheticatorAvailable && <>
          <li className='gluey'>
            <BiometricAuth onChange={handleChange} sett={sett} />
          </li>
        </>}
      </ul>

      {message && <p className='message'>{message}</p>}

      <button type='button' className='saveSettings' onClick={handleSubmit}>{t('save')}</button>
    </main>
    <Footer />
  </>
}