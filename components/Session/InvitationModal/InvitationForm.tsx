import { Controller } from 'react-hook-form';
import { IoIosArrowDropdown } from 'react-icons/io';

import InputField from '@/ui/InputField';
import { PermissionEnum } from '@/models/enums';

const InvitationForm: React.FC<{ control: any; errors: any }> = ({ control, errors }) => (
  <div className='space-y-4'>
    <Controller
      name='email'
      control={control}
      rules={{
        required: 'Email is required.',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email address.',
        },
      }}
      render={({ field }) => (
        <InputField
          id='invite-email'
          label='Collaborator Email'
          {...field}
          type='email'
          placeholder='name@example.com'
          error={errors.email?.message}
          required
          marginBottom={20}
        />
      )}
    />
    <Controller
      name='role'
      control={control}
      render={({ field }) => (
        <div>
          <label htmlFor='permission-select' className='block text-sm font-medium text-gray-700 mb-1'>
            Select Role
          </label>
          <div className='relative'>
            <select
              id='permission-select'
              className='p-3 w-full rounded-lg bg-white border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10'
              {...field}
            >
              {Object.values(PermissionEnum)
                .filter((el) => el !== PermissionEnum.ADMIN)
                .map((permission) => (
                  <option key={permission} value={permission}>
                    {permission.toUpperCase()}
                  </option>
                ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
              <IoIosArrowDropdown size={25} />
            </div>
          </div>
        </div>
      )}
    />
  </div>
);

export default InvitationForm;
