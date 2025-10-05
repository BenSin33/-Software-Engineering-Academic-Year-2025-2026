import Image from "next/image"
import { HiUserCircle } from "react-icons/hi"
import { HiChat } from "react-icons/hi"
import { HiBell } from "react-icons/hi"
export function Header(){
    return(
        <>
        <header style={{backgroundColor: 'white'}} className="flex items-center justify-between h-full">
            <p className="font-bold text-2xl ml-[3rem]">SSB <span style={{color:'#FFAC50'}}>1.0</span></p>
            <div className="flex items-center gap-3 pr-3">
                <HiBell size={25} className="text-[#FFAC50]"/>
                <HiChat size={25} className="text-[#FFAC50]"/>
                <HiUserCircle className="text-[#FFAC50]" size={40}/>
                <p>Admin</p>
            </div>
        </header>
        </>
    )
}