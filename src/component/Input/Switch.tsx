import type { InputHTMLAttributes } from 'react'
import { cls } from '../../lib/classNames'
import './Switch.css'

type SwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string,
}
export function Switch(props: SwitchProps) {
  const { className, id: inputId, ...inputProps } = props
  const classes = cls('Switch', className)
  const id = inputId ?? `switch-${inputProps.name ?? ''}`

  return <>
    <div className={classes}>
      <input id={id} type="checkbox" hidden {...inputProps} />
      <label htmlFor={id} />
    </div>
  </>
}