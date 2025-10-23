'use client';

import { 
    Calendar, Map, CheckSquare, Users, Home, Bus, AlertTriangle, 
    LayoutDashboard, UserCircle, HeartHandshake, Route 
} from 'lucide-react';
import type { JSX, SVGProps } from 'react';

// Allowed icon name literals
type IconName =
  | 'Calendar'
  | 'Map'
  | 'CheckSquare'
  | 'LayoutDashboard'
  | 'UserCircle'
  | 'Users'
  | 'HeartHandshake'
  | 'Route'
  | 'Home'
  | 'Bus'
  | 'AlertTriangle';

export function IconMap({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>): JSX.Element | null {
  switch (name) {
    // Các icon cho Driver
    case 'Calendar':
      return <Calendar {...props} />;
    case 'Map':
      return <Map {...props} />;
    case 'CheckSquare':
      return <CheckSquare {...props} />;
    
    // ✅ Các icon mới cho Admin
    case 'LayoutDashboard':
        return <LayoutDashboard {...props} />;
    case 'UserCircle':
        return <UserCircle {...props} />;
    case 'Users': // Dùng chung cho cả admin và driver
        return <Users {...props} />;
    case 'HeartHandshake':
        return <HeartHandshake {...props} />;
    case 'Route':
        return <Route {...props} />;

    // Các icon cũ khác
    case 'Home':
      return <Home {...props} />;
    case 'Bus':
        return <Bus {...props} />;
    case 'AlertTriangle':
        return <AlertTriangle {...props} />;
    default:
      return null;
  }
}