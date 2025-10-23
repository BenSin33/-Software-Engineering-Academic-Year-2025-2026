
'use client'
import { NavModule } from './NavModule'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

// Kiểu cho từng module (menu item)
export interface ModuleItem {
  text: string
  url?: string
  icon?: React.ComponentType<any> 
  subModules?: ModuleItem[] 
}


interface SidebarProps {
  list: ModuleItem[]
}

export function Sidebar({ list = [] }: SidebarProps) {
  const pathName = usePathname()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    if (activeIndex === index) setActiveIndex(null)
    else setActiveIndex(index)
  }

  const showSubModule = (
    subModules: ModuleItem[],
    activeIndex: number | null,
    index: number,
    pathName: string
  ) => {
    return (
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          activeIndex === index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-3">
          {subModules.map((subModule, subIndex) => (
            <li key={`${subIndex}-${subModule.text}`}>
              <NavModule
                clickedModule={pathName === subModule.url}
                isSubModule={true}
                item={subModule}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FFFF99' }} className="pt-5 h-full w-full">
      <ul className="flex flex-col flex-start gap-[1.5rem]">
        {list.map((item, index) => (
          <li key={`${index}-${item.text}`}>
            <NavModule
              isActiveModule={activeIndex === index}
              clickedModule={pathName === item.url}
              item={item}
              setIndex={() => handleToggle(index)}
            />
            {item.subModules && showSubModule(item.subModules, activeIndex, index, pathName)}
          </li>
        ))}
      </ul>
    </div>
  )
}

/*

  return(
    <>
      <div style={{backgroundColor:'#FFFF99'}} className="pt-5 h-full w-full">

          <ul className="flex flex-col flex-start gap-[1.5rem]">
            {list.map((item,index)=>(
              
                <li key={`${index}-${item.text}`}>
                   <NavModule isActiveModule={activeIndex===index} item={item} setIndex={()=>{handleToggle(index)}}/>
                   {item.subModules && showSubModule(item.subModules,activeIndex,index)}
                </li>
            ))}
          </ul>
      </div>
    </>
  )
}
*/