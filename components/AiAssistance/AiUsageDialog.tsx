import React from 'react';

import { FiZap } from 'react-icons/fi';

import { IAiToolUsage } from '@/models/models';
import WorkspaceModal from '@/components/common/WorkspaceModal';
import { formatAiToolName } from '@/helpers/aiToolPresentation';
import { formatAiUsageDate } from '@/helpers/timeHelpers';
import useClipboard from '@/hooks/common/useClipboard';

import TextResultPanel from './TextResultPanel';

export default function AiUsageDialog({
  isModalOpen,
  selectedUsage,
  closeModal,
}: {
  isModalOpen: boolean;
  selectedUsage: IAiToolUsage | null;
  closeModal: () => void;
}) {
  const onCopy = useClipboard();

  return (
    <WorkspaceModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onCancel={closeModal}
      cancelText='Close'
      title='A look at your request.'
      description={
        selectedUsage
          ? `${formatAiToolName(selectedUsage.toolName)} · ${formatAiUsageDate(selectedUsage.timestamp)}`
          : 'Your original text and AI result.'
      }
      icon={<FiZap size={21} aria-hidden='true' />}
      className='max-w-[960px]'
    >
      {selectedUsage && (
        <div className='grid grid-cols-2 gap-5'>
          <TextResultPanel
            title='Original text'
            text={selectedUsage.sentText}
            onCopy={() => onCopy(selectedUsage.sentText)}
          />
          <TextResultPanel title='AI result' text={selectedUsage.result} onCopy={() => onCopy(selectedUsage.result)} />
        </div>
      )}
    </WorkspaceModal>
  );
}
