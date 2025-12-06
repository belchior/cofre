import type { InputHTMLAttributes } from 'react'
import { cls } from '../../lib/classNames'
import './Checkbox.css'

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