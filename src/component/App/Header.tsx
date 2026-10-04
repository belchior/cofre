import { Link } from 'react-router'
import { IconGear, IconLogotype } from '../Icon/Icon'
import './Header.css'

export function Header() {
  return <>
    <header className='Header'>
      <Link className='homeLink' to="/cofre/home">
        <IconLogotype />
      </Link >
      <Link to="/cofre/settings" className='button b-r'>
        <IconGear />
      </Link>
    </header>
  </>
}