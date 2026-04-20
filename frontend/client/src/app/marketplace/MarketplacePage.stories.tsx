import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import MarketplacePage from './page';
import { ThemeProvider } from '@/theme/ThemeContext';

const meta: Meta<typeof MarketplacePage> = {
  title: 'Pages/Marketplace',
  component: MarketplacePage,
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
      navigation: { pathname: '/marketplace' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MarketplacePage>;

export const ApplyCategoryFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Locate and click the Filter dropdown button
    const filterButton = canvas.getByRole('button', { name: /Filter/i });
    await userEvent.click(filterButton);

    // 2. Since "Vitamins" appears on a product and in the dropdown,
    // we use getAllByText, which returns an array. The dropdown option is likely the first or second one.
    // Alternatively, we can scope our search to the active dropdown container:
    
    // In our component, the dropdown doesn't have a unique role, so let's find the text and click it. 
    // We know the mock product contains "Daily Essential Vitamins", while the dropdown contains exactly "Vitamins".
    // Using exact: true forces an exact string match.
    const vitaminsOptions = await canvas.findAllByText('Vitamins', { exact: true });
    
    // We click the element we know is the dropdown option (the one meant to be clicked).
    // If exact match still returns multiple, click the first one:
    await userEvent.click(vitaminsOptions[0]);

    // 3. Close the filter dropdown
    await userEvent.click(filterButton);

    // Filter button text should update to indicate (1) active filter
    await expect(filterButton).toHaveTextContent('Filter (1)');
    
    // 4. Verify the product is rendered
    const vitaminProduct = await canvas.findByText('Daily Essential Vitamins');
    await expect(vitaminProduct).toBeInTheDocument();
  },
};