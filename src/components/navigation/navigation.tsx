import React from 'react'
import { useHashLocation } from 'wouter/use-hash-location'

export const Navigation: React.FC = () => {
  const [location] = useHashLocation()

  const linkClass = (path: string): string => {
    // Remove query string for comparison
    const locationPath = location.split('?')[0]
    const isActive = locationPath === path || (path === '/' && (locationPath === '' || locationPath === '/' || locationPath === '/add'))
    return `pa2 ph3 no-underline f6 fw4 ${
      isActive ? 'white bg-white-20 br-pill' : 'white-70 hover-white'
    }`
  }

  return (
    <nav className='flex items-center justify-center pv3 bb b--white-10'>
      <div className='flex gap3' style={{ gap: '1rem' }}>
        <a href='#/' className={linkClass('/')}>
          Add Files
        </a>
        <a href='#/manage' className={linkClass('/manage')}>
          Manage Files
        </a>
      </div>
    </nav>
  )
}
