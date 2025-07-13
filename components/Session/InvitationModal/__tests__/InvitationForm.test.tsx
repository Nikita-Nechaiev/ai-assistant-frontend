/**
 * @jest-environment jsdom
 */
import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FieldErrors } from 'react-hook-form';

import { PermissionEnum } from '@/models/enums';

import InvitationForm from '../InvitationForm';

/* ------------------------------------------------------------------ */
/*                    helper: render form with react-hook-form         */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*                               tests                                */
/* ------------------------------------------------------------------ */
describe('InvitationForm', () => {
  it('renders email input and role select with READ & EDIT options (no ADMIN)', () => {
    renderForm();

    // email field
    const emailInput = screen.getByLabelText(/collaborator email/i);

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');

    // select contains READ and EDIT, but not ADMIN
    const select = screen.getByLabelText(/select role/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);

    expect(options).toEqual(expect.arrayContaining([PermissionEnum.READ, PermissionEnum.EDIT]));
    expect(options).not.toContain(PermissionEnum.ADMIN);
  });

  it('updates role value when user selects another option', () => {
    renderForm();

    const select = screen.getByLabelText(/select role/i) as HTMLSelectElement;

    // default is READ
    expect(select.value).toBe(PermissionEnum.READ);

    // change to EDIT
    fireEvent.change(select, { target: { value: PermissionEnum.EDIT } });
    expect(select.value).toBe(PermissionEnum.EDIT);
  });

  it('shows validation error passed via props', () => {
    renderForm({ email: { message: 'Invalid email address.' } } as any);

    expect(screen.getByText(/invalid email address\./i)).toBeInTheDocument();
  });
});
