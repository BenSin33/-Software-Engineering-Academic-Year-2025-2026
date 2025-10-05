import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { useState } from "react";

export function NavModule({ isActiveModule, item,setIndex, isSubModule = false }: any) {
  const [isHover,setIsHover]=useState(false)
  const Icon = item.icon;
  const RenderModules = () => (
    <div>
      <div className={`flex items-center gap-5 ${isSubModule?'ml-3':''}`}>
        {/* <Image src="/user.svg" alt="User Icon" width={`${isSubModule?25:30}`} height={`${isSubModule?25:30}`} /> */}
        <Icon className={`${isHover?'text-white':'text-[#FFAC50]'}`} size={`${isSubModule?25:30}`}/>
        <p className={`${isSubModule?'text-[1rem]':'text-[1.1rem]'}`}>{item.text}</p>
      </div>
    </div>
  );
  
  return (
    <>
      <div onMouseOver={()=>setIsHover(true)} onMouseLeave={()=>setIsHover(false)} className="flex items-center cursor-pointer gap-2 justify-between hover:bg-[#FFAC50] hover:text-white transition-colors duration-150 px-3 py-1 pr-5">
        {!item.subModules? (
          <Link href={`${item.url}`}>
            <RenderModules/>
          </Link>
        ) : (
          <div onClick={setIndex}>
               <RenderModules/>
          </div>
        )}

        {item.subModules ? (
          <HiArrowRight className={`cursor-pointer ${isHover?'text-white':'text-[#FFAC50]'} ${isActiveModule && 'rotate-90'} transition-transform duration-500`} size={25}/>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
