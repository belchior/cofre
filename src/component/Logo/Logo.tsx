import LogoSvg from '../../logo.svg'
import './Logo.css'

export function Logo() {
  return <>
    <img className='Logo' src={LogoSvg} alt='Application Logo' />
  </>
}