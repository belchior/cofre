import { Link } from 'react-router'
import { IconGear } from '../Icon/Icon'

import './Header.css'

export function Header() {
  return <>
    <header className='Header'>
      <Link to="/cofre">
        <h1>Cofre</h1>
      </Link >
      <Link to="/cofre/settings" className='button b-r'>
        <IconGear />
      </Link>
    </header>
  </>
}