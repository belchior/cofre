import React from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cls } from '../../lib/classNames'
import './Input.css'

type InputPasswordProps = InputHTMLAttributes<HTMLInputElement> & {
  viewMode?: boolean,
}

function InputPassword(props: InputPasswordProps) {
  const { viewMode = false, ...inputProps } = props
  const [show, setShow] = React.useState(false)
  const toggleShow = () => setShow(!show)

  const classesShow = cls([show === false, 'hide'])
  const [text, inputType] = show
    ? ['hide', 'text']
    : ['show', 'password']

  return <>
    {viewMode === true && <span className={classesShow}>{show ? props.value : String(props.value)?.replace(/./g, '*')}</span>}
    {viewMode === false && <input {...inputProps} type={inputType} />}
    <button type='button' className='show-password' onClick={toggleShow}>{text}</button>
  </>
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string,
  message?: string,
  viewMode?: boolean,
}

export function Checkbox(props: CheckboxProps) {
  const { className, label, viewMode = false, ...inputProps } = props
  const classes = cls('Checkbox', className, [viewMode, 'view'])

  return (
    <div className={classes}>
      <label htmlFor={inputProps.id}>{label}</label>
      <input {...inputProps} />
    </div>
  )
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode,
  label?: string,
  message?: string,
  viewMode?: boolean,
  ref?: React.RefObject<null>,
}
export function Input(props: InputProps) {
  const { label, icon, message, className, viewMode = false, ...inputProps } = props
  const isPassword = props.type === 'password'

  const classes = cls('Input', className)
  const classesInputBox = cls('inputBox', [icon, ' with-icon'], [isPassword, ' password'], [viewMode, 'view'])

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
          ? <InputPassword {...inputProps} viewMode={viewMode} />
          : viewMode
            ? <span>{props.value}</span>
            : <input {...inputProps} />
        }
      </div>
    </div>
  )
}
