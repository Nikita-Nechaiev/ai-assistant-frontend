import React, { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className='flex-1 pl-[40px] pt-[100px] overflow-auto bg-gray-100'>
      {children}
    </main>
  );
};

export default MainContent;
