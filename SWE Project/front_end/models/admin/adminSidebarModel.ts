"use client"
import { GrOverview,GrSchedule } from "react-icons/gr";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { PiStudentBold } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";
import { ImRoad } from "react-icons/im";
import { TbScanPosition } from "react-icons/tb";
import { FaBusAlt } from "react-icons/fa";

export const adminSidebarModel = [
    {
        text:'Overview',
        url: '/Overview',
        icon: GrOverview,
        
    },
    {
        text: 'Drivers',
        url: '/Drivers',
        icon: BsFillPersonVcardFill
    },
    {
        text: 'Students',
        url: '/Students',
        icon: PiStudentBold
    },
    {
        text: 'Parents',
        url: '/Parents',
        icon: RiParentFill
    },
    {
        text: 'Tracks',
        url: '/Tracks',
        icon: TbScanPosition,
        subModules:[
            {
                text:'Schedules',
                url:'/Schedules',
                icon: GrSchedule
            },
            {
                text:'Routes',
                url:'/Routes',
                icon: ImRoad
            },
            {
                text:'Buses',
                url:'/Buses',
                icon: FaBusAlt
            },
        ]
    }
]