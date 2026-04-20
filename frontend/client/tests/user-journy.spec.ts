import { test, expect, type Page } from '@playwright/test';

// Mark as serial so they run in order using the same context.
// If one step fails, the subsequent tests will automatically be skipped.
test.describe.serial('End-to-End User Journey (Separated)', () => {
  
  let page: Page;
  let testEmail: string;
  const testPassword = 'Password123!';

  // Set up a single shared browser page BEFORE the tests start
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const timestamp = Date.now();
    testEmail = `testuser_${timestamp}@example.com`;
  });

  // Clean up the page AFTER all tests are done
  test.afterAll(async () => {
    await page.close();
  });

  test('1. User can sign up', async () => {
    await page.goto('http://localhost:3000/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByPlaceholder('John Doe').fill('test');
    await page.getByPlaceholder('e.g., +63 912 345 6789').fill('09123456789');
    await page.getByPlaceholder('name@example.com').fill(testEmail);
    await page.getByPlaceholder('Create a password').fill(testPassword);
    
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Account Created')).toBeVisible({ timeout: 10000 });
    
    await page.getByRole('button', { name: 'Proceed to Login' }).click();
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  });

  test('2. User can log in', async () => {
    // We should already be on the login page from the previous test, 
    // but going explicitly handles edge cases.
    await page.goto('http://localhost:3000/login');

    await page.getByPlaceholder('name@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);
    
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    // Use waitForURL to handle initial Next.js compile delays
    await page.waitForURL(/.*\/marketplace/, { timeout: 30000 });
    await expect(page).toHaveURL(/.*\/marketplace/);
  });

  test('3. User can navigate to profile and edit their username', async () => {
    // The session is maintained from the previous test, so we are on /marketplace

    // Option A: Assuming there is a UI button to take them to the profile
    // await page.getByRole('link', { name: 'Profile' }).click(); 
    
    // Option B: Navigate directly if you haven't built the UI button yet
    await page.goto('http://localhost:3000/profile');

    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();

    const firstNameInputContainer = page.locator('div').filter({ hasText: /^First Name$/ });
    await firstNameInputContainer.locator('input').fill('john');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Profile successfully updated!');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByRole('heading', { name: /john/i })).toBeVisible();
  });

});