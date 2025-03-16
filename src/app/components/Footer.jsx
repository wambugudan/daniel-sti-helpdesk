import React from 'react'

const Footer = () => {
  return (
    <footer className='border-teal-50 text-gray-700 text-center py-4'>
        <p className='text-sm font-medium'>
            &copy; {new Date().getFullYear()} STI Policy HelpDesk. All rights reserved.
        </p>
    </footer>
  )
}

export default Footer

