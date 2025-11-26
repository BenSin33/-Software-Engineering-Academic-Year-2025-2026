// File: components/Layouts/IconMap.tsx
'use client';

// lucide-react icons
import { LayoutDashboard, UserCircle, Users, HeartHandshake, Route, Bus, Calendar, Map, CheckSquare } from 'lucide-react';

//  1. Import the new icons from react-icons
import { HiExclamationCircle, HiDocumentReport, HiBell } from 'react-icons/hi';

export function IconMap({ name, ...props }) {
  // name is the string, e.g., 'LayoutDashboard', 'HiBell'
  // ...props are things like className, size, etc.

  switch (name) {
    // --- Icons from lucide-react ---
    case 'LayoutDashboard':
      return <LayoutDashboard {...props} />;
    case 'UserCircle':
      return <UserCircle {...props} />;
    // ... other lucide-react icons

    //  2. Add new cases for the react-icons
    case 'HiExclamationCircle':
      return <HiExclamationCircle {...props} />;
    case 'HiDocumentReport':
      return <HiDocumentReport {...props} />;
    case 'HiBell':
      return <HiBell {...props} />;

    default:
      // Return a default icon or null if no match is found
      return null;
  }
}