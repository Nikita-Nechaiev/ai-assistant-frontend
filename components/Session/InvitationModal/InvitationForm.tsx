import React from 'react';

import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FiChevronDown } from 'react-icons/fi';

import { Input } from '@/components/ui/input';
import { PermissionEnum } from '@/models/enums';

export interface InvitationFormInputs {
  email: string;
  role: PermissionEnum;
}

const InvitationForm = ({
  control,
  errors,
}: {
  control: Control<InvitationFormInputs>;
  errors: FieldErrors<InvitationFormInputs>;
}) => (
  <div className='space-y-4'>
    <Controller
      name='email'
      control={control}
      rules={{
        required: 'Email is required.',
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address.' },
      }}
      render={({ field }) => (
        <div>
          <label htmlFor='invite-email' className='mb-2 block text-sm font-medium'>
            Collaborator email
          </label>
          <Input
            id='invite-email'
            {...field}
            type='email'
            placeholder='name@example.com'
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'invite-email-error' : undefined}
          />
          {errors.email && (
            <p id='invite-email-error' role='alert' className='mt-2 text-sm text-destructive'>
              {errors.email.message}
            </p>
          )}
        </div>
      )}
    />
    <Controller
      name='role'
      control={control}
      render={({ field }) => (
        <div>
          <label htmlFor='permission-select' className='mb-2 block text-sm font-medium'>
            Access level
          </label>
          <div className='relative'>
            <select
              id='permission-select'
              {...field}
              className='h-10 w-full appearance-none rounded-md border border-input bg-white px-3 pr-9 text-base shadow-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            >
              <option value={PermissionEnum.READ}>Viewer — can read documents</option>
              <option value={PermissionEnum.EDIT}>Editor — can create and edit</option>
            </select>
            <FiChevronDown
              size={14}
              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              aria-hidden='true'
            />
          </div>
          <p className='mt-2 text-sm text-muted-foreground'>Choose the right level of access for your collaborator.</p>
        </div>
      )}
    />
  </div>
);

export default InvitationForm;
