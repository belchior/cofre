import React, { type InputHTMLAttributes, type ReactNode } from 'react'
import { cls } from '../../lib/classNames'
import { t } from '../../lib/translation'
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
    ? [t('hide'), 'text']
    : [t('show'), 'password']

  return <>
    {viewMode === true && <span className={classesShow}>{show ? props.value : String(props.value)?.replace(/./g, '*')}</span>}
    {viewMode === false && <input {...inputProps} type={inputType} autoComplete='false' />}
    <button type='button' className='show-password' onClick={toggleShow}>{text}</button>
  </>
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode,
  label?: string,
  message?: string,
  name: string,
  description?: string,
  viewMode?: boolean,
  ref?: React.RefObject<null>,
}
export function Input(props: InputProps) {
  const { label, icon, message, name, className, description, viewMode = false, ...inputProps } = props
  const isPassword = props.type === 'password'

  const classes = cls('Input', className)
  const classesInputBox = cls('inputBox', [icon, ' with-icon'], [isPassword, ' password'], [viewMode, 'view'])

  if (props.hidden) {
    return <input name={name} {...inputProps} />
  }

  return (
    <div className={classes}>
      {label && <label htmlFor={inputProps.id}>{label}</label>}
      {message && <span className="message">{message}</span>}
      <div className={classesInputBox}>
        {icon}
        {isPassword
          ? <InputPassword name={name} {...inputProps} viewMode={viewMode} />
          : viewMode
            ? <span>{props.value}</span>
            : <input name={name} {...inputProps} />
        }
      </div>
      {description && <p className='input-desc'>{description}</p>}
    </div>
  )
}
