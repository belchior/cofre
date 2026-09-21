import React from 'react'
import { Link, useNavigate } from 'react-router'
import { AppBackup } from './AppBackup'
import { AppUpdate } from './AppUpdate'
import { BiometricAuth } from './BiometricAuth'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { PinAuth } from './PinAuth'
import { SettingsContext } from './SettingsProvider'
import { t } from '../../lib/translation'
import * as storage from '../../lib/storage'

import './Settings.css'

type ViewProps = {
  message?: React.ReactNode,
  onChange: (data: Partial<storage.ISettings>) => void,
  onSubmit: () => void,
  sett: storage.ISettings,
}

function View(props: ViewProps) {
  return <>
    <Header />
    <main className='Settings'>
      <h2>{t('configurations')}</h2>
      <ul>
        <li className='gluey'>
          <PinAuth onChange={props.onChange} sett={props.sett} />
        </li>
        <li className='gluey'>
          <BiometricAuth onChange={props.onChange} sett={props.sett} />
        </li>
      </ul>

      <ul>
        <li className='gluey'>
          <AppUpdate onChange={props.onChange} sett={props.sett} />
        </li>
      </ul>

      <ul>
        <li className='gluey'>
          <AppBackup />
        </li>
      </ul>

      {props.message && <p className='message'>{props.message}</p>}

      <div className='actions'>
        <Link to='/cofre' className='button'>{t('go_back')}</Link>
        <button type='button' onClick={props.onSubmit}>{t('save')}</button>
      </div>
    </main>
    <Footer />
  </>
}

export function Settings() {
  const context = React.use(SettingsContext)
  const [sett, setSettings] = React.useState(context.settings)
  const [message, setMessage] = React.useState<string>()
  const navigate = useNavigate()

  const handleChange = (newSett: Partial<storage.ISettings>) => {
    setSettings(prevSett => {
      if (prevSett == null) return
      return { ...prevSett, ...newSett }
    })
  }

  const handleSubmit = () => {
    const selectedAuthMethod = [sett?.enableBiometricAuth, sett?.enablePinAuth].includes(true)
    if (sett == null || selectedAuthMethod === false) {
      setMessage(() => t('choose_auth_method'))
      return
    }
    if (sett.enableBiometricAuth && sett.credential == null) {
      setMessage(() => t('access_key_is_required'))
      return
    }
    if (sett.enablePinAuth && (sett.pin == null || sett.pin === '')) {
      setMessage(() => t('pin_is_required'))
      return
    }
    context.saveSettings(sett)
    navigate('/cofre', { replace: true })
  }

  React.useEffect(() => {
    setSettings(context.settings)
  }, [context.settings])

  if (sett == null) return null

  return <View
    message={message}
    onChange={handleChange}
    onSubmit={handleSubmit}
    sett={sett}
  />
}