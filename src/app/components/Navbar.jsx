'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {Menu, X} from "lucide-react"
import { usePathname } from 'next/navigation'


const links = [
    {href:"/submissions", label:"all work request"},
    {href:"/my-work-request", label:"my work request"},
    {href:"/expert-profile", label:"expert profile"},
    {href:"/my-invites", label:"my invites"},
    {href:"/bidded-projects", label:"bidded projects"}
]


const Navbar = () => {
    // Checking if munu is open when in a small screen
    const [menuOpen, setMenuOpen] = useState(false)

    // Fetch current path link
    const pathname = usePathname()

    // Hide Navbar when in the homepage
  if (pathname === "/") return null;  

  return (
    <nav className='bg-teal-50 py-1'>
        {/* Ensuring log is always at top and centered */}
        <div className=' flex items-center justify-center w-full my-2'>
            <Link href="/" className='flex items-center'>
                <Image
                    src= "/assets/images/acts-logo.png"
                    loading="lazy"
                    alt="logo"
                    width={60}
                    height={30}
                />
                <h3 className='text-xl font-bold ml-3'>STI Policy HelpDesk</h3>
            </Link>
        </div>
            
        {/* Navbar container */}
        <div>
            {/* menu button on small screens */}
            <button
                className='md:hidden absolute right-4 top-3 text-gray-700'
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? <X size={28}/> : <Menu size={28} />}
            </button>

            {/* Menu links */}
            <div
                // Conditional formating of menu based on screen size
                className= {
                    `${menuOpen ? "flex" : "hidden"}
                    flex-col md:flex md:flex-row md:justify-center md:items-center md:space-x-8 px-6 pd-4 md:pb-0`
                }
            >
                {
                    links.map(link => {
                        const isActive = pathname === link.href 
                        return(
                            <Link
                                key={link.href}
                                href={link.href}
                                // conditional formating the links
                                className={`capitalize font-semibold text-gray-700 px-4 py-2 rounded-md transition ${
                                    isActive
                                    ? "bg-gray-200 text-teal-800" // Active Link Style
                                    : "hover:bg-gray-100 hover:text-teal-600"
                                }`}
                            >
                                {link.label}
                            </Link>
                    )})
                }
            </div>
        </div>
        
    </nav>
  )
}

export default Navbar