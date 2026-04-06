import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, fn } from '@storybook/test';
import LoginPage from './page';

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/Auth/Login',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true, 
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

// 1. Default State: Just the empty form
export const Default: Story = {};

// 2. Failed Login State
export const FailedLogin: Story = {
  decorators: [
    (Story) => {
      // Intercept the browser's fetch API to return a fake error response
      window.fetch = fn().mockResolvedValue({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Incorrect email or password' }),
      });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Simulate user typing in wrong credentials
    await userEvent.type(canvas.getByLabelText(/Email/i), 'wrong@example.com');
    await userEvent.type(canvas.getByLabelText(/Password/i), 'wrongpassword');
    
    // Simulate clicking the Log In button
    await userEvent.click(canvas.getByRole('button', { name: /Log In/i }));
    
    // Assert that the red error text appears on the screen
    await expect(await canvas.findByText('Incorrect email or password')).toBeInTheDocument();
  },
};

// 3. Successful Login State
export const SuccessfulLogin: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      // Overriding the Next.js router specifically for this story to intercept the redirect
      navigation: {
        push: fn(), 
      },
    },
  },
  decorators: [
    (Story) => {
      // Intercept fetch to return a fake successful response
      window.fetch = fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ 
          user: { id: '123', email: 'user@example.com' },
          session: { access_token: 'fake-jwt-token' }
        }),
      });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Simulate user typing in correct credentials
    await userEvent.type(canvas.getByLabelText(/Email/i), 'correct@example.com');
    await userEvent.type(canvas.getByLabelText(/Password/i), 'correctpassword');
    
    // Simulate clicking the Log In button
    await userEvent.click(canvas.getByRole('button', { name: /Log In/i }));
    
    // Because router.push is mocked in the parameters, the component won't actually 
    // navigate away, so you can see it in its "done" form.
  },
};