import React from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cls } from '../../lib/classNames'
import './Input.css'

export type InputPasswordProps = InputHTMLAttributes<HTMLInputElement>

function InputPassword(props: InputPasswordProps) {
  const [show, setShow] = React.useState(false)
  const toggleShow = () => setShow(!show)

  const [text, inputType] = show
    ? ['hide', 'text']
    : ['show', 'password']

  return <>
    <input {...props} type={inputType} />
    <button type='button' className='show-password' onClick={toggleShow}>{text}</button>
  </>
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode,
  label?: string,
  message?: string,
}
export function Input(props: InputProps) {
  const { label, icon, message, className, ...inputProps } = props
  const isPassword = props.type === 'password'

  const classes = cls('Input', className)
  const classesInputBox = cls('inputBox', [icon, ' with-icon'], [isPassword, ' password'])

  if (props.hidden) {
    return <input {...inputProps} />
  }

  return (
    <div className={classes}>
      {label && <label htmlFor={inputProps.id}>{label}</label>}
      {message && <span className="message">{message}</span>}
      <div className={classesInputBox}>
        {icon}
        {isPassword
          ? <InputPassword {...inputProps} />
          : <input {...inputProps} />
        }
      </div>
    </div>
  )
}
