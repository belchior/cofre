import type { InputHTMLAttributes } from 'react'
import { cls } from '../../lib/classNames'
import './Switch.css'

type SwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string,
  title?: string,
  description?: string,
}
export function Switch(props: SwitchProps) {
  const { className, id: inputId, title, description, ...inputProps } = props
  const classes = cls('Switch', className)
  const id = inputId ?? `switch-${inputProps.name ?? ''}`

  return <>
    <div className={classes}>
      {title && <h3 className='title'>{title}</h3>}
      {description && <p className='description'>{description}</p>}
      <input id={id} type="checkbox" hidden {...inputProps} />
      <label htmlFor={id} />
    </div>
  </>
}