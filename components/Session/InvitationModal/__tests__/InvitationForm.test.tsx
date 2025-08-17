import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FieldErrors } from 'react-hook-form';

import { PermissionEnum } from '@/models/enums';

import InvitationForm from '../InvitationForm';

type FormInputs = { email: string; role: PermissionEnum };

const renderForm = (errors: FieldErrors<FormInputs> = {}) => {
  const Wrapper: React.FC = () => {
    const { control } = useForm<FormInputs>({
      defaultValues: { email: '', role: PermissionEnum.READ },
    });

    return <InvitationForm control={control} errors={errors} />;
  };

  return render(<Wrapper />);
};

describe('InvitationForm', () => {
  it('renders email input and role select with READ & EDIT options (no ADMIN)', () => {
    renderForm();

    const emailInput = screen.getByLabelText(/collaborator email/i);

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');

    const select = screen.getByLabelText(/select role/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);

    expect(options).toEqual(expect.arrayContaining([PermissionEnum.READ, PermissionEnum.EDIT]));
    expect(options).not.toContain(PermissionEnum.ADMIN);
  });

  it('updates role value when user selects another option', () => {
    renderForm();

    const select = screen.getByLabelText(/select role/i) as HTMLSelectElement;

    expect(select.value).toBe(PermissionEnum.READ);

    fireEvent.change(select, { target: { value: PermissionEnum.EDIT } });
    expect(select.value).toBe(PermissionEnum.EDIT);
  });

  it('shows validation error passed via props', () => {
    renderForm({ email: { message: 'Invalid email address.' } } as any);

    expect(screen.getByText(/invalid email address\./i)).toBeInTheDocument();
  });
});
