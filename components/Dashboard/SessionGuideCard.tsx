import { FiUsers, FiFolderPlus, FiUserPlus, FiFileText } from 'react-icons/fi';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SessionGuideCard() {
  return (
    <Card className='overflow-hidden border-border shadow-card'>
      <div className='border-b border-border bg-gradient-to-br from-accent/80 to-white px-5 pb-5 pt-5'>
        <div className='mb-4 flex items-center justify-between'>
          <span className='flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-white text-primary'>
            <FiUsers size={18} aria-hidden='true' />
          </span>
          <Badge variant='secondary' className='border border-blue-100 bg-white text-[13px] font-medium text-primary'>
            Shared sessions
          </Badge>
        </div>
        <h2 className='text-xl font-semibold tracking-tight'>Create. Invite. Collaborate.</h2>
        <p className='mt-2 text-sm leading-[1.8] text-muted-foreground'>
          Bring your team into one workspace.
          <br />
          Build better documents together.
        </p>
      </div>
      <div className='space-y-5 p-5'>
        {[
          { Icon: FiFolderPlus, title: 'Create a session', text: 'Start a shared workspace for your project.' },
          { Icon: FiUserPlus, title: 'Invite colleagues', text: 'Send invitations and choose their roles.' },
          {
            Icon: FiFileText,
            title: 'Work on shared documents',
            text: 'Write, refine, and discuss your ideas together.',
          },
        ].map((item) => {
          const { Icon, title, text } = item;

          return (
            <div key={title} className='flex items-center gap-3'>
              <Icon className='shrink-0 text-primary/70' size={18} aria-hidden='true' />
              <div>
                <p className='text-sm font-semibold'>{title}</p>
                <p className='mt-1 text-[13px] leading-5 text-muted-foreground'>{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
