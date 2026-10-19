import React, { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main id='main-content' className='min-h-0 flex-1 overflow-auto bg-muted px-9 py-8'>
      {children}
    </main>
  );
};

export default MainContent;
