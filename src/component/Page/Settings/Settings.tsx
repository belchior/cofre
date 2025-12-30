import React from 'react'
import { Link } from 'react-router'
import { Footer } from '../../App/Footer'
import { Header } from '../../App/Header'
import { InputPin, Switch } from '../../Input'
import { SettingsContext } from '../../Provider/SettingsProvider'
import './Settings.css'

export function Settings() {
  const context = React.use(SettingsContext)
  const [state, setState] = React.useState(context.settings)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    setState(prev => {
      console.log('setState', prev)

      if (prev == null) return
      const [current, other] = elem.name === 'enablePinAuth'
        ? [elem.checked, prev.enableBiometricAuth]
        : [elem.checked, prev.enablePinAuth]

      const nextState = current === true && other === true
        ? { ...prev, enablePinAuth: false, enableBiometricAuth: false, [elem.name]: true }
        : { ...prev, [elem.name]: elem.checked }

      return nextState
    })
  }

  const handlePinSubmit = (pin: string) => {
    setState(prev => {
      if (prev) return { ...prev, pin }
    })
  }

  const handleSave = () => {
    if (state) {
      context.saveSettings(state)
    }
  }

  React.useEffect(() => {
    if (context.settings != null) {
      setState(() => context.settings)
    }
  }, [context.settings])

  // TODO the load of settings is async, the load state should be properly handled
  if (state == null) {
    return <>
      <Header />
      <main className='Main Settings'>
        <h2>Configurações</h2>
      </main>
      <Footer />
    </>
  }

  return <>
    <Header />
    <main className='Main Settings'>
      <h2>Configurações</h2>

      <ul>
        <li className='row'>
          <h3>Autenticação via PIN</h3>
          <p>
            Habilitando autenticação via PIN ao iniciar uma sessão será
            solicitado um identificador de 4 dígitos.
          </p>
          <Switch name='enablePinAuth' onChange={handleChange} defaultChecked={state.enablePinAuth} />

          {state.enablePinAuth && (
            <InputPin
              label='Insira seu PIN'
              onSubmit={handlePinSubmit}
              pin={state.pin}
            />
          )}
        </li>
      </ul>

      <div className='actions'>
        <Link to='/cofre' className='button'>voltar</Link>
        <button type='button' onClick={handleSave}>salvar</button>
      </div>
    </main>
    <Footer />
  </>
}