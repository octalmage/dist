import i18n from 'i18next'
import React, { useState } from 'react'
import { Trans } from 'react-i18next'
import { localesList } from '../../i18n.js'
import LanguagePicker from '../../media/images/language.jsx'
import Dropdown from '../dropdown/dropdown.jsx'
import NodeInfo from '../node-info/node-info'

const Footer = (): React.JSX.Element => {
  const anchorClass = 'no-underline underline-hover aqua'
  const defaultLanguage = window.localStorage.getItem('i18nextLng')?.split('-')[0]
  const [selectedLanguage, setLanguage] = useState(defaultLanguage)

  const onLocaleChange = (locale: string): void => {
    window.localStorage.setItem('i18nextLng', locale)
    setLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  return (
    <div className='flex-ns items-center pt5 pb3 ph4 f7 white '>
      <div className="mr2 pb1">
        <Trans i18nKey='powered-by-helia'>
          Powered by <a className={anchorClass} href="https://github.com/ipfs/helia" title="Helia" target='_blank' rel='noopener noreferrer'>Helia</a>
        </Trans>
      </div>
      <div className='mr2 pb1 dn dib-ns'>
          |
      </div>
      <div className='pb1'>
       <NodeInfo />
      </div>
    </div>
  )
}

export default Footer
