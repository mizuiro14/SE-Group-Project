import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import SignupPage from './page';

const meta: Meta<typeof SignupPage> = {
  title: 'Pages/Signup',
  component: SignupPage,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignupPage>;

export const Default: Story = {};

export const FillSignupFormAsSeller: Story = {
    play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Enter Full Name & Contact using their placeholders
    const fullNameInput = canvas.getByPlaceholderText('John Doe');
    await userEvent.type(fullNameInput, 'John Doe');
    
    const contactInput = canvas.getByPlaceholderText('e.g., +63 912 345 6789');
    await userEvent.type(contactInput, '+63 912 345 6789');

    // 2. Select "Seller" Role (This works because the input is nested in the label)
    const sellerRadio = canvas.getByLabelText('Seller');
    await userEvent.click(sellerRadio);
    await expect(sellerRadio).toBeChecked();

    // 3. Fill the Branch field using placeholder
    const branchInput = canvas.getByPlaceholderText('e.g., Jaro, Iloilo');
    await userEvent.type(branchInput, 'Jaro, Iloilo');

    const EmailInput = canvas.getByPlaceholderText('name@example.com');
    await userEvent.type(EmailInput, 'john.doe@example.com');

    const PasswordInput = canvas.getByPlaceholderText('Create a password');
    await userEvent.type(PasswordInput, 'SecurePassword123');

    // Assert values are successfully recorded
    await expect(fullNameInput).toHaveValue('John Doe');
    await expect(branchInput).toHaveValue('Jaro, Iloilo');
    await expect(EmailInput).toHaveValue('john.doe@example.com');
    await expect(PasswordInput).toHaveValue('SecurePassword123');
  },
};

export const FillSignupFormAsBuyer: Story = {
    play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Enter Full Name & Contact using their placeholders
    const fullNameInput = canvas.getByPlaceholderText('John Doe');
    await userEvent.type(fullNameInput, 'John Doe');
    
    const contactInput = canvas.getByPlaceholderText('e.g., +63 912 345 6789');
    await userEvent.type(contactInput, '+63 912 345 6789');

    // 2. Select "Seller" Role (This works because the input is nested in the label)
    const buyerRadio = canvas.getByLabelText('Buyer');
    await userEvent.click(buyerRadio);
    await expect(buyerRadio).toBeChecked();

    const EmailInput = canvas.getByPlaceholderText('name@example.com');
    await userEvent.type(EmailInput, 'john.doe@example.com');

    const PasswordInput = canvas.getByPlaceholderText('Create a password');
    await userEvent.type(PasswordInput, 'SecurePassword123');

    // Assert values are successfully recorded
    await expect(fullNameInput).toHaveValue('John Doe');
    await expect(EmailInput).toHaveValue('john.doe@example.com');
    await expect(PasswordInput).toHaveValue('SecurePassword123');
  },
};