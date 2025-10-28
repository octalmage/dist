import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { BoxAddCode } from '../components/box/box-add-code'
import { BoxDownloadCode } from '../components/box/box-download-code'
import { BoxNotAvailable } from '../components/box/box.jsx'
import { FileManager } from '../components/file-manager/file-manager'
import { Navigation } from '../components/navigation/navigation'
import { useCurrentPage } from '../hooks/use-current-page.js'
import { useHelia } from '../hooks/use-helia.js'

export const Page = (): React.JSX.Element => {
  const [t] = useTranslation()
  const currentPage = useCurrentPage()
  const heliaState = useHelia()
  const isDownload = currentPage === 'download'
  const isManage = currentPage === 'manage'
  let content

  if (heliaState.error != null) {
    content = <BoxNotAvailable error={heliaState.error} />
  } else if (isManage) {
    content = <FileManager />
  } else if (isDownload) {
    content = <BoxDownloadCode />
  } else {
    content = <BoxAddCode />
  }

  return (
    <div data-id='Page'>
      <Helmet>
        <title>{t('pageTitle.ipfs')} | { isDownload ? t('pageTitle.download') : t('pageTitle.add') }</title>
      </Helmet>
      {!isDownload && <Navigation />}

      <div className='flex flex-column items-center ph3 ph4-l pv4'>
        <div className='w-100' style={{ maxWidth: '1000px' }}>
          { content }
        </div>
      </div>
    </div>
  )
}
