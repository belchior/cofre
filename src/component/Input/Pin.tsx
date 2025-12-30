import React from 'react'
import { Input } from './Input'
import './Pin.css'

type InputPinProps = {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (pin: string) => void,
  circularFocus?: boolean,
  autoFocus?: boolean,
  label?: string,
  pin?: string,
}
export function InputPin(props: InputPinProps) {
  const { onSubmit, label, autoFocus = false, circularFocus = false, pin = '' } = props

  const [nextFocus, setFocus] = React.useState(0)
  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ]

  const handleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    const current = Number(elem.name.at(-1))
    const next = circularFocus === true
      ? (current + 1) % inputRefs.length
      : current + 1

    if (event.code.startsWith('Digit')) {
      elem.value = event.code.at(-1) ?? elem.value
      setFocus(next)
    }

    const pin = inputRefs.reduce((acc, item) => {
      acc += item.current?.value
      return acc
    }, '')

    const isValid = pin.length === inputRefs.length && Number(pin) >= 0

    if (isValid) {
      onSubmit(pin)
    }
  }

  React.useEffect(() => {
    inputRefs.at(nextFocus)?.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextFocus])

  return <>
    <div className='InputPin'>
      {label && <label htmlFor='digit-0'>{label}</label>}
      {inputRefs.map((ref, index) => {
        const name = `digit-${index}`
        const defaultValue = pin.at(index)
        return (
          <Input
            autoFocus={autoFocus && index === 0}
            id={name}
            defaultValue={defaultValue}
            inputMode='numeric'
            key={index}
            maxLength={1}
            name={name}
            onKeyUp={handleChange}
            // @ts-expect-error ignore
            ref={ref}
            type="text"
          />
        )
      })}
    </div>
  </>
}