import React from 'react'
import { useTranslation } from 'react-i18next'
import NodeInfo from '../node-info/node-info'

const Header = (): React.JSX.Element => {
  const { t } = useTranslation('translation')
  return (
    <div className='flex flex-column flex-row-l items-start'>
      <div className='flex items-center pa4' style={{ height: '150px' }}>
        <div className='ml2 pb2 f2 fw1 aqua montserrat'>{t('header')}</div>
      </div>
      <div className='ml-auto mt2-l mb0-l pa3 pb0 w-100 order-2-l pl3 pl4-ns mw7-l'>
        <NodeInfo />
      </div>
    </div>
  )
}

export default Header
