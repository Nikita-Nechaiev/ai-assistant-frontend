'use client';

import { navigation } from '@/helpers/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NavigationList = () => {
  const pathname = usePathname();

  return (
    <nav className='flex-1'>
      <ul className='space-y-2 p-4'>
        {navigation.map((item, index) => {
          const isActive = pathname === item.href; // Check if the current path matches the navigation item's href
          return (
            <li key={index}>
              <Link
                href={item.href}
                className={`block px-2 py-2 rounded-md transition text-center ${
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationList;
