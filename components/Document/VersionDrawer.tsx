'use client';

import React from 'react';

import { IoMdClose } from 'react-icons/io';

import Drawer from '@/ui/Drawer';
import { IVersion } from '@/models/models';

import VersionItem from './VersionItem';

interface VersionDrawerProps {
  isOpen: boolean;
  versions: IVersion[];
  previewContent: string;
  selectedVersion: IVersion | null;
  handleSelectVersion: (version: IVersion) => void;
  handleApplyVersion: () => void;
  handleClose: () => void;
  handleSetPreview: (version: IVersion) => void;
}

const VersionDrawer: React.FC<VersionDrawerProps> = ({
  isOpen,
  versions,
  selectedVersion,
  handleSelectVersion,
  handleApplyVersion,
  handleClose,
  handleSetPreview,
}) => {
  const onMouseLeave = () => {
    if (selectedVersion) {
      handleSetPreview(selectedVersion);

      return;
    }

    if (versions.length > 0) {
      handleSetPreview(versions[0]);
    }
  };

  return (
    <Drawer isOpen={isOpen} handleClose={handleClose} initialWidth={40} minWidth={25} maxWidth={70}>
      <div className='p-4'>
        <div className='sticky top-0 z-10 p-4 border-b border-mainLightGray flex justify-between items-center bg-mainLight'>
          <button onClick={handleClose} className='text-mainGray hover:text-mainDarkHover transition'>
            <IoMdClose size={30} />
          </button>
          <h2 className='text-xl font-semibold text-mainDark'>Versions</h2>
        </div>
        <div className='mt-4'>
          <button
            onClick={handleApplyVersion}
            disabled={!selectedVersion || selectedVersion.id === versions[0].id}
            className={`w-full py-3 text-lg font-semibold rounded-lg mb-5 transition ${
              !selectedVersion || selectedVersion.id === versions[0].id
                ? 'bg-mainLightGray text-mainGray cursor-not-allowed'
                : 'bg-mainDark text-mainLight hover:bg-mainDarkHover'
            }`}
          >
            Apply Version
          </button>
        </div>
        <div className='max-h-[60vh] overflow-y-auto pr-2'>
          {versions.map((version, index) => (
            <VersionItem
              key={index}
              version={version}
              isSelected={selectedVersion?.id === version.id}
              isCurrent={version?.id === versions[0].id && !selectedVersion}
              onClick={handleSelectVersion}
              onMouseEnter={handleSetPreview}
              onMouseLeave={onMouseLeave}
            />
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default VersionDrawer;
