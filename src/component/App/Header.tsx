import { Link } from 'react-router'
import { IconGear } from '../Icon/Icon'
import { LogoType } from '../Logo/Logo'
import './Header.css'

export function Header() {
  return <>
    <header className='Header'>
      <Link to="/cofre">
        <LogoType />
      </Link >
      <Link to="/cofre/settings" className='button b-r'>
        <IconGear />
      </Link>
    </header>
  </>
}