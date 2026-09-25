import LogoSvg from '../../logo.svg'
import LogoTypeSvg from '../../logoType.svg'

export function Logo() {
  return <>
    <img
      alt='Application Logo'
      className='Logo'
      height={48}
      src={LogoSvg}
    />
  </>
}

export function LogoType() {
  return <>
    <img
      alt='Application Logotype'
      className='LogoType'
      height={24}
      src={LogoTypeSvg}
    />
  </>
}