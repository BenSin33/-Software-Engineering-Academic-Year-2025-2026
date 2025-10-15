
'use client'
import { NavModule} from './NavModule'
import { useState } from 'react'

export function Sidebar({list=[]}:any){
  const [activeIndex,setActiveIndex] = useState(null)

  const handleToggle=(index)=>{
    if(activeIndex===index)
    setActiveIndex(null);
    else
    setActiveIndex(index)
  }

  const showSubModule = (subModules, activeIndex, index) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        activeIndex===index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
      }`}
    >
      <ul className="flex flex-col gap-3">
        {subModules.map((subModule, index) => (
          
          <li key={`${index}-${subModule.text}`}>
            <NavModule
              isSubModule={true}
              item={subModule}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

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

