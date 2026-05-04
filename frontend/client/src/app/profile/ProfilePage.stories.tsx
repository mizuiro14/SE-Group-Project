import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, fn } from '@storybook/test';
import ProfilePage from './page';
import { ThemeProvider } from '@/theme/ThemeContext';

const meta: Meta<typeof ProfilePage> = {
  title: 'Pages/Profile',
  component: ProfilePage,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfilePage>;

export const EditPersonalInformation: Story = {
  play: async ({ canvasElement }) => {
    // 1. Mock fetch for BOTH getting the user info and saving updates
    window.fetch = fn().mockImplementation((url) => {
      // Mock the update save request
      if (url.includes('/api/users/update')) {
         return Promise.resolve({ ok: true });
      }
      
      // Mock the initial user fetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: {
            email: 'test@example.com',
            user_metadata: {
              username: 'John Doe',
              first_name: 'John',
              last_name: 'Doe',
              contact: '1234567890',
              role: 'buyer'
            }
          }
        })
      });
    });

    // 2. Mock window alert to prevent it hanging Storybook on success
    window.alert = fn();

    const canvas = within(canvasElement);

    // 3. Wait for fetch to finish and populate inputs
    const firstNameInput = await canvas.findByDisplayValue('John');
    
    // 4. Edit the fields
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');
    
    const phoneInput = await canvas.findByDisplayValue('1234567890');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '+1987654321');

    // Assert inputs changed
    await expect(firstNameInput).toHaveValue('Jane');
    await expect(phoneInput).toHaveValue('+1987654321');

    // 5. Click the "Save Changes" button to push the draft state into the `user` state
    const saveButton = canvas.getByRole('button', { name: /Save Changes/i });
    await userEvent.click(saveButton);

    // 6. Assert the sidebar name updated based on the new First + Last name combination ("Jane Doe")
    const updatedSidebarName = await canvas.findByText('Jane Doe');
    await expect(updatedSidebarName).toBeInTheDocument();
  },
};

export const SwitchProfileTabs: Story = {
  play: async ({ canvasElement }) => {
    // Helper function to wait for a specified number of milliseconds
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 1. We still need to mock fetch so the page renders out of the "loading" state
    window.fetch = fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        user: {
          email: 'test@example.com',
          user_metadata: { username: 'John Doe', role: 'buyer' }
        }
      })
    });

    const canvas = within(canvasElement);

    // Wait for the default "Personal Info" tab to be visible
    const personalInfoHeading = await canvas.findByRole('heading', { name: 'Personal Information' });
    await expect(personalInfoHeading).toBeVisible();

    // Wait 3 seconds before first switch
    await delay(1000);

    // 2. Switch to Addresses Tab
    const addressesTabButton = canvas.getByRole('button', { name: 'Addresses' });
    await userEvent.click(addressesTabButton);
    
    // Assert the Addresses content rendered
    const addressesHeading = await canvas.findByRole('heading', { name: 'Saved Addresses' });
    await expect(addressesHeading).toBeVisible();
    await expect(personalInfoHeading).not.toBeInTheDocument(); // The old tab should disappear

    // Wait 3 seconds
    await delay(1000);

    // 3. Switch to Payment Methods Tab
    const paymentTabButton = canvas.getByRole('button', { name: 'Payment Methods' });
    await userEvent.click(paymentTabButton);
    
    const paymentHeading = await canvas.findByRole('heading', { name: 'Payment Methods', level: 2 });
    await expect(paymentHeading).toBeVisible();
    // Validate that the mock payment cards rendered
    const defaultCard = canvas.getByText('Visa');
    await expect(defaultCard).toBeInTheDocument();

    // Wait 3 seconds
    await delay(1000);

    // 5. Check Order History Empty State
    const orderHistoryButton = canvas.getByRole('button', { name: 'Order History' });
    await userEvent.click(orderHistoryButton);
    
    const emptyStateText = await canvas.findByText('This section is not yet implemented.');
    await expect(emptyStateText).toBeVisible();

    await delay(1000);

        // 4. Switch to Preferences Tab
    const prefsTabButton = canvas.getByRole('button', { name: 'Preferences' });
    await userEvent.click(prefsTabButton);
    
    const themeHeading = await canvas.findByRole('heading', { name: 'Application Theme' });
    await expect(themeHeading).toBeVisible();
    
    // Wait 3 seconds
    await delay(3000);
  },
};