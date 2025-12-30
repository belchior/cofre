import { InputPin } from '../../Input'
import './Auth.css'

function PinAuth() {
  const handleSubmit = (pin: string) => {
    console.log(pin)
  }

  return <>
    <main className='Main PinAuth'>
      <h2>
        Insira seu <abbr title='Personal Identification Number'>PIN</abbr>
      </h2>
      <InputPin onSubmit={handleSubmit} autoFocus circularFocus />
    </main>
  </>
}

export function Auth() {
  return <>
    <PinAuth />
  </>
}