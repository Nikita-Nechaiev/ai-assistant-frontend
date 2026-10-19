'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiZap, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import { IconType } from 'react-icons';

import { navigation } from '@/helpers/navigation';
import { cn } from '@/lib/utils';

const NavigationList = () => {
  const pathname = usePathname();
  const icons: Record<string, IconType> = {
    '/dashboard': FiGrid,
    '/ai-assistance': FiZap,
    '/faq': FiHelpCircle,
  };

  return (
    <nav aria-label='Main navigation'>
      <ul className='space-y-1.5'>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = icons[item.href] ?? FiGrid;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon size={18} aria-hidden='true' />
                <span>{item.label}</span>
                {isActive && <FiArrowRight className='ml-auto' size={14} aria-hidden='true' />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationList;
