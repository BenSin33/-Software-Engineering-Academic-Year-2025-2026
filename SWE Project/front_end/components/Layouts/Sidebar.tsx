'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { NavModule } from './NavModule'
import Image from 'next/image'
export interface ModuleItem {
  text: string
  url?: string
  icon?: React.ComponentType<any>
  subModules?: ModuleItem[]
}

interface SidebarProps {
  list: ModuleItem[]
  isOpen?: boolean
}

export function Sidebar({ list = [], isOpen = false }: SidebarProps) {
  const pathName = usePathname()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <aside
      className={`fixed lg:static left-0 top-[50px] h-[calc(100vh-50px)] w-64 bg-yellow-100 shadow-lg z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >


      {/* Logo Section */}
      <div className ="flex items-center justify-center py-4">
        <Image 
            src = "/favicon.ico" 
            alt="Logo"  
            width = {0} 
            height = {0} 
            sizes='100vw'
            className ="w-full max-w-[150px] h-auto mx-auto" />
      </div>

      <ul className="pt-5 flex flex-col gap-6">
        {list.map((item, index) => (
          <li key={`${index}-${item.text}`}>
            <NavModule
              item={item}
              isActiveModule={activeIndex === index}
              clickedModule={pathName === item.url}
              setIndex={() => handleToggle(index)}
            />
            {item.subModules && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="flex flex-col gap-3 pl-4">
                  {item.subModules.map((sub, subIndex) => (
                    <li key={`${subIndex}-${sub.text}`}>
                      <NavModule
                        item={sub}
                        isSubModule={true}
                        clickedModule={pathName === sub.url}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}