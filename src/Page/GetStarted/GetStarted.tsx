import React from 'react'
import { useNavigate } from 'react-router'
import { BiometricAuth } from '../Settings/BiometricAuth'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { Notification } from '../../component/Notification/Notification'
import { PinAuth } from '../Settings/PinAuth'
import { t } from '../../lib/translation'
import { useNotification } from '../../component/Notification/Notification.hook'
import * as auth from '../../lib/auth'
import * as cryptoKey from '../../lib/cryptoKey'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import './GetStarted.css'

export function GetStarted() {
  const notify = useNotification()
  const navigate = useNavigate()
  const authMethods = useDetectAuthMethods()
  const [state, setState] = React.useState({
    sett: storage.initialSettings(),
    ud: storage.initialUserData(),
  })

  const handleChange = async (partSett: Partial<storage.Settings>, partUd: Partial<storage.UserData>) => {
    setState(prev => {
      const enabled = auth.enabledAuthMethod(partSett)
      return {
        sett: {
          ...(enabled !== '' ? auth.disableAuthMethod(prev.sett) : prev.sett) as storage.Settings,
          ...partSett,
        },
        ud: {
          ...prev.ud,
          ...partUd,
        },
      }
    })
  }

  const handleSubmit = async () => {
    const [isValid, message] = storage.isSettingsValid(state.sett)

    if (isValid === false) {
      notify.setNotification('error', message)
      return
    }

    await cryptoKey.add(state.sett, state.ud)
    const ck = cryptoKey.load()
    await storage.saveUserData(ck, state.ud)
    await storage.saveSettings(state.sett)
    navigate('/cofre/login', { replace: false })
    return
  }

  React.useEffect(() => {
    (async () => {
      if (storage.hasSettings()) {
        navigate('/cofre/login', { replace: false })
        return
      }
    })()
  })

  return <>
    <main className='GetStarted'>
      <IconLogo />
      <h1>{t('choose_auth_method')}</h1>
      <ul>
        <li className='gluey'>
          <PinAuth
            notify={notify}
            onChange={handleChange}
            sett={state.sett}
            ud={state.ud}
          />
        </li>
        {authMethods.biometricAuth && <>
          <li className='gluey'>
            <BiometricAuth
              notify={notify}
              onChange={handleChange}
              sett={state.sett}
              ud={state.ud}
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

function useDetectAuthMethods() {
  const [state, setState] = React.useState({
    pinAuth: true,
    biometricAuth: false,
  })

  React.useEffect(() => {
    (async () => {
      if (state.biometricAuth === true) return
      const biometricAuth = await webAuthn.isAuthenticatorAvailable()
      setState(prev => ({ ...prev, biometricAuth }))
    })()
  }, [state, setState])

  return state
}