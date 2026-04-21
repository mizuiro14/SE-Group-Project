import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Configuration for the Storybook page
const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button', // How it appears in the sidebar
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// The "Primary" variant story
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

// The "Secondary" variant story (Your new dark green!)
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

// Multiple states displayed together
export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const PressedState: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      {/* Using the scale class directly to force the visual pressed state in Storybook without needing to click */}
      <Button variant="primary" className="scale-[0.98] ring-2 ring-offset-2 ring-[#8EAD45]">
        Pressed Primary
      </Button>
      <Button variant="secondary" className="scale-[0.98] ring-2 ring-offset-2 ring-[#1B3625]">
        Pressed Secondary
      </Button>
      <Button variant="outline" className="scale-[0.98] ring-2 ring-offset-2 ring-slate-200">
        Pressed Outline
      </Button>
    </div>
  ),
};