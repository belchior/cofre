import React from 'react'
import { cls } from '../../lib/classNames'
import { Input } from './Input'
import './Pin.css'

type InputPinProps = {
  autoFocus?: boolean,
  circularFocus?: boolean,
  className?: string,
  label?: string,
  message?: string,
  name: string,
  onSubmit: (pin: string) => void,
  pin?: string,
  tabIndex?: number,
}
export function InputPin(props: InputPinProps) {
  const {
    className,
    label,
    message,
    name,
    onSubmit,
    tabIndex,
    autoFocus = false,
    circularFocus = false,
    pin = '',
  } = props

  const [nextFocus, setFocus] = React.useState(0)
  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ]

  const classes = cls('InputPin', className)

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
    <div className={classes}>
      {label && <label htmlFor={`${name}-0`}>{label}</label>}
      {message && <span className="message">{message}</span>}
      {inputRefs.map((ref, index) => {
        const inputName = `${name}-${index}`
        const defaultValue = pin.at(index)
        return (
          <Input
            autoFocus={autoFocus && index === 0}
            id={inputName}
            defaultValue={defaultValue}
            inputMode='numeric'
            key={index}
            maxLength={1}
            name={inputName}
            onKeyUp={handleChange}
            // @ts-expect-error ignore
            ref={ref}
            tabIndex={tabIndex}
            type="text"
          />
        )
      })}
    </div>
  </>
}