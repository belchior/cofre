import React from 'react'
import { Link, useNavigate } from 'react-router'
import { AppUpdate } from './AppUpdate'
import { BiometricAuth } from './BiometricAuth'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { PinAuth } from './PinAuth'
import { SettingsContext } from './SettingsProvider'
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
    <main className='Main Settings'>
      <h2>Configurações</h2>
      <ul>
        <li className='row'>
          <PinAuth onChange={props.onChange} sett={props.sett} />
        </li>
        <li className='row'>
          <BiometricAuth onChange={props.onChange} sett={props.sett} />
        </li>
        <li className='row'>
          <AppUpdate onChange={props.onChange} sett={props.sett} />
        </li>
      </ul>

      {props.message && <p className='message'>{props.message}</p>}

      <div className='actions'>
        <Link to='/cofre' className='button'>voltar</Link>
        <button type='button' onClick={props.onSubmit}>salvar</button>
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
      setMessage(() => 'Selecione uma forma de autenticação')
      return
    }
    if (sett.enableBiometricAuth && sett.credential == null) {
      setMessage(() => 'É necessário criar uma chave de acesso')
      return
    }
    if (sett.enablePinAuth && (sett.pin == null || sett.pin === '')) {
      setMessage(() => 'É necessário criar um PIN')
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