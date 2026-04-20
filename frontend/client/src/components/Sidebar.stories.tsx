import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/theme/ThemeContext';

// We wrap the Sidebar in your actual ThemeProvider so styles work
const meta: Meta<typeof Sidebar> = {
  title: 'Components/Layout/Sidebar',
  component: Sidebar,
  parameters: {
    // Next.js router mocking for Storybook
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/marketplace', // Mock the active route
      },
    },
    // Removes the default padding from the Storybook preview canvas
    layout: 'fullscreen', 
  },
  decorators: [
    (Story) => (
      // Wrap it in your ThemeProvider so the useTheme() hook doesn't crash
      <ThemeProvider>
        {/* We add a fixed height and gray background just to visualize it nicely */}
        <div style={{ height: '100vh', display: 'flex', backgroundColor: '#f3f4f6' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Default view (Path is mocked to /marketplace as active)
export const Default: Story = {};

export const BestsellersActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/bestsellers', // Mock a different active route
      },
    },
  },
};

export const StockActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/stock', // Mock a different active route
      },
    },
  },
};

export const DeliveryActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/delivery', // Mock a different active route
      },
    },
  },
};

export const ProfileActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/profile', // Mock a different active route
      },
    },
  },
};

export const MembersActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/members', // Mock a different active route
      },
    },
  },
};