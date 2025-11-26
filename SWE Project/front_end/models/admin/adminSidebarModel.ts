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
        url: '/AdminDashboard/Dashboard',
        icon: GrOverview,
        
    },
    {
        text: 'Users',
        url: '/AdminDashboard/Users',
        icon: BsFillPersonVcardFill
    },
    {
        text: 'Drivers',
        url: '/AdminDashboard/Drivers',
        icon: BsFillPersonVcardFill
    },
    {
        text: 'Students',
        url: '/AdminDashboard/Students',
        icon: PiStudentBold
    },
    {
        text: 'Parents',
        url: '/AdminDashboard/Parents',
        icon: RiParentFill
    },
    {
        text: 'Tracks',
        url: '/AdminDashboard/Tracks',
        icon: TbScanPosition,
        subModules:[
            {
                text:'Routes',
                url:'/AdminDashboard/Routes',
                icon: ImRoad
            },
            {
                text:'Schedules',
                url:'/AdminDashboard/Schedules',
                icon: ImRoad,
            },
            {
                text:'Buses',
                url:'/AdminDashboard/Buses',
                icon: FaBusAlt
            },
        ]
    }
]