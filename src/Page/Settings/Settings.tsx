import React from 'react'
import { Link } from 'react-router'
import { Footer } from '../../component/App/Footer'
import { Header } from '../../component/App/Header'
import { PinAuth, type PinAuthData } from './PinAuth'
import { SettingsContext } from './SettingsProvider'
import * as storage from '../../lib/storage'

import './Settings.css'

type ViewProps = {
  onSubmitPinAuth: (data: PinAuthData) => void,
  handleSave: () => void,
  sett: storage.ISettings,
}

function View(props: ViewProps) {
  return <>
    <Header />
    <main className='Main Settings'>
      <h2>Configurações</h2>

      <ul>
        <li className='row'>
          <PinAuth onSubmit={props.onSubmitPinAuth} sett={props.sett} />
        </li>
      </ul>

      <div className='actions'>
        <Link to='/cofre' className='button'>voltar</Link>
        <button type='button' onClick={props.handleSave}>salvar</button>
      </div>
    </main>
    <Footer />
  </>
}

export function Settings() {
  const context = React.use(SettingsContext)
  const [state, setState] = React.useState(context.settings)

  const onSubmitPinAuth = (data: PinAuthData) => {
    setState(prev => {
      if (prev == null) return
      return { ...prev, ...data }
    })
  }

  const handleSave = () => {
    if (state) {
      context.saveSettings(state)
    }
  }

  React.useEffect(() => {
    setState(context.settings)
  }, [context.settings])

  if (state == null) return null

  return <View
    handleSave={handleSave}
    onSubmitPinAuth={onSubmitPinAuth}
    sett={state}
  />
}