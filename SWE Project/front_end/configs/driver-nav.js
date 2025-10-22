
import { Calendar, Map, CheckSquare, Users } from "lucide-react"; // Make sure icons are imported

export const driverNavList = [
  {
    icon: 'Calendar', // ✅ Pass a string name
    text: "Lịch trình",
    link: "/driver/schedule",
  },
  {
    icon: 'Map', // ✅ Pass a string name
    text: "Hành trình",
    subModules: [
      {
        icon: 'CheckSquare', // ✅ Pass a string name
        text: "Điểm danh",
        link: "/driver/journey/tracking",
      },
      {
        icon: 'Users', // ✅ Pass a string name
        text: "Học sinh",
        link: "/driver/journey/students",
      },
    ],
  },
];