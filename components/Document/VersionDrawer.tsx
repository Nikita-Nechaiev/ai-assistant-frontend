'use client';

import React from 'react';

import { FiClock, FiRotateCcw } from 'react-icons/fi';

import Drawer from '@/components/common/Drawer';
import PanelHeader from '@/components/common/PanelHeader';
import { Button } from '@/components/ui/button';
import { IVersion } from '@/models/models';

import VersionItem from './VersionItem';

interface VersionDrawerProps {
  isOpen: boolean;
  versions: IVersion[];
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
    if (selectedVersion) handleSetPreview(selectedVersion);
    else if (versions[0]) handleSetPreview(versions[0]);
  };
  const canApply = !!selectedVersion && selectedVersion.id !== versions[0]?.id;

  return (
    <Drawer
      isOpen={isOpen}
      handleClose={handleClose}
      initialWidth={34}
      minWidth={25}
      maxWidth={65}
      title='Version history'
    >
      <PanelHeader
        title='Version history'
        description='Every draft is part of the story. Preview or restore an earlier version.'
        icon={<FiClock size={19} aria-hidden='true' />}
        onClose={handleClose}
      />
      <div className='min-h-0 flex-1 overflow-y-auto bg-muted/50 px-5 py-5'>
        <div className='mb-4 flex items-center justify-between text-[13px] text-muted-foreground'>
          <span className='font-medium uppercase tracking-wider'>Document timeline</span>
          <span>
            {versions.length} {versions.length === 1 ? 'version' : 'versions'}
          </span>
        </div>
        {versions.length ? (
          <div className='space-y-3'>
            {versions.map((version) => (
              <VersionItem
                key={version.id}
                version={version}
                isSelected={selectedVersion?.id === version.id}
                isCurrent={version.id === versions[0]?.id}
                onClick={handleSelectVersion}
                onMouseEnter={handleSetPreview}
                onMouseLeave={onMouseLeave}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-xl border border-dashed border-border bg-white px-5 py-10 text-center'>
            <FiClock size={24} className='mx-auto mb-3 text-primary' aria-hidden='true' />
            <p className='text-base font-medium'>Your story starts here.</p>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>
              Saved document versions will appear in this timeline.
            </p>
          </div>
        )}
      </div>
      <div className='shrink-0 border-t border-border bg-white p-5'>
        <p className='mb-3 text-sm leading-5 text-muted-foreground'>
          {canApply
            ? 'Ready to return to this draft? Apply it to make it the current version.'
            : 'Select an earlier version to preview and restore it.'}
        </p>
        <Button onClick={handleApplyVersion} disabled={!canApply} className='h-10 w-full text-sm'>
          <FiRotateCcw size={15} aria-hidden='true' />
          Apply version
        </Button>
      </div>
    </Drawer>
  );
};

export default VersionDrawer;
