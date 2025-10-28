import React from 'react'

export interface HeadlineProps {
  imgHeight?: number
  isDownload: boolean
}

const Headline: React.FC<HeadlineProps> = () => {
  return (
    <div className='flex items-center justify-center pv4 bb b--white-10'>
      <div className='tc'>
        <h1 className='f3 fw3 white montserrat ma0 tracked-tight'>o8 dist</h1>
        <p className='f6 fw3 white-60 montserrat ma0 mt2'>share code, peer to peer</p>
      </div>
    </div>
  )
}

export default Headline
