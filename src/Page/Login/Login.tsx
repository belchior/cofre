import React from 'react'
import { cls } from '../../lib/classNames'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { InputPin } from '../../component/Input'
import { Notification } from '../../component/Notification/Notification'
import { SettingsContext } from '../Settings/SettingsProvider'
import { t } from '../../lib/translation'
import { updateAppVersionIfNeed } from '../Settings/AppUpdate'
import { useNavigate } from 'react-router'
import { useNotification, type Notify } from '../../component/Notification/Notification.hook'
import * as auth from '../../lib/auth'
import * as serde from '../../lib/serde'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import './Login.css'

function usedAuthMethods(sett?: storage.ISettings) {
  if (sett == null) return []
  return Object.entries(sett)
    .filter(([key, value]) => key.endsWith('Auth') && value === true)
    .map(([key]) => key)
}

function onlyPinAuth(sett?: storage.ISettings) {
  const authMethods = usedAuthMethods(sett)
  if (authMethods.length !== 1) return false
  return authMethods[0] === 'enablePinAuth'
}

type PinAuthLoginProps = {
  className?: string,
  notify: Notify,
  onSubmit: (pin: string) => void,
}
function PinAuthLogin(props: PinAuthLoginProps) {
  const handleSubmit = async (pin: string) => {
    const isValid = await auth.isPinValid(pin)

    if (isValid === false) {
      props.notify.setNotification(prev => ({ ...prev, type: 'error', isOpen: true, message: t('invalid_pin') }))
      return
    }

    const pinHash = await auth.createPinHash(pin)
    props.onSubmit(pinHash)
  }

  return <>
    <p>{t('enter_your')} <abbr title='Personal Identification Number'>PIN</abbr></p>
    <InputPin
      autoFocus
      circularFocus
      className={props.className}
      name='login'
      onSubmit={handleSubmit}
    />
  </>
}

type BiometricAuthLoginProps = {
  className?: string,
  notify: Notify,
  onSubmit: (pin: string) => void,
  sett: storage.ISettings,
}
function BiometricAuthLogin(props: BiometricAuthLoginProps) {
  const HandleAuthentication = async () => {
    try {
      if (props.sett.passKey == null) {
        throw new Error('passkey_not_found')
      }

      await webAuthn.authenticatePassKey(props.sett.passKey)
      const id = serde.serializeBuffer(props.sett.passKey.id)
      props.onSubmit(id)
      return
    } catch (error) {
      const errorMessage = (error as Error).message
      let message = t('authentication_fail')

      if (errorMessage.includes('The operation either timed out or was not allowed')) {
        message = t('operation_not_allowed')
      }

      props.notify.setNotification(prev => ({ ...prev, type: 'error', isOpen: true, message }))
      console.error('Passkey authentication error:', errorMessage)
    }
  }

  return <>
    <button
      className={cls('gluey', props.className)}
      onClick={HandleAuthentication}
      type="button"
    >{t('auth_using_biometric')}</button>
  </>
}

export function Login() {
  const navigate = useNavigate()
  const notify = useNotification()
  const context = React.use(SettingsContext)
  const [chosePinAuth, setChosePinAuth] = React.useState(false)

  const handleSubmit = async (additionalData: string) => {
    await auth.addSession(additionalData)
    navigate('/cofre', { replace: true })
    return
  }

  const handleClick = () => {
    setChosePinAuth(() => true)
  }

  React.useEffect(() => {
    (async () => {
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        navigate('/cofre', { replace: true })
        return
      }

      const hasValidSettings = [
        context.settings?.enableBiometricAuth,
        context.settings?.enablePinAuth,
      ].includes(true)

      if (hasValidSettings === false) {
        navigate('/cofre/get-started', { replace: true })
        return
      }

      if (context.settings) {
        updateAppVersionIfNeed(context.settings)
      }
    })()
  })

  return <>
    <main className='Login'>
      <IconLogo />
      <h1>{t('login')}</h1>
      <div className="container">
        {context.settings?.enablePinAuth && (
          onlyPinAuth(context.settings) || chosePinAuth
            ? <PinAuthLogin className='mb-1' onSubmit={handleSubmit} notify={notify} />
            : <button type="button" className='gluey' onClick={handleClick}>{t('auth_using_pin')}</button>
        )}
        {context.settings?.enableBiometricAuth && (
          <BiometricAuthLogin
            notify={notify}
            onSubmit={handleSubmit}
            sett={context.settings}
          />
        )}
      </div>
    </main>
    <Footer />
    <Notification
      message={notify.message}
      onClose={notify.closeNotification}
      open={notify.isOpen}
      type={notify.type}
    />
  </>
}