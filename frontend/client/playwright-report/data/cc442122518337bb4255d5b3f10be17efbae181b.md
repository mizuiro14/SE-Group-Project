# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journy.spec.ts >> End-to-End User Journey (Separated) >> 1. User can sign up
- Location: tests\user-journy.spec.ts:23:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/signup", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | 
  3  | // Mark as serial so they run in order using the same context.
  4  | // If one step fails, the subsequent tests will automatically be skipped.
  5  | test.describe.serial('End-to-End User Journey (Separated)', () => {
  6  |   
  7  |   let page: Page;
  8  |   let testEmail: string;
  9  |   const testPassword = 'Password123!';
  10 | 
  11 |   // Set up a single shared browser page BEFORE the tests start
  12 |   test.beforeAll(async ({ browser }) => {
  13 |     page = await browser.newPage();
  14 |     const timestamp = Date.now();
  15 |     testEmail = `testuser_${timestamp}@example.com`;
  16 |   });
  17 | 
  18 |   // Clean up the page AFTER all tests are done
  19 |   test.afterAll(async () => {
  20 |     await page.close();
  21 |   });
  22 | 
  23 |   test('1. User can sign up', async () => {
> 24 |     await page.goto('http://localhost:3000/signup');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  25 |     await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  26 | 
  27 |     await page.getByPlaceholder('John Doe').fill('test');
  28 |     await page.getByPlaceholder('e.g., +63 912 345 6789').fill('09123456789');
  29 |     await page.getByPlaceholder('name@example.com').fill(testEmail);
  30 |     await page.getByPlaceholder('Create a password').fill(testPassword);
  31 |     
  32 |     await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();
  33 | 
  34 |     await expect(page.getByText('Account Created')).toBeVisible({ timeout: 10000 });
  35 |     
  36 |     await page.getByRole('button', { name: 'Proceed to Login' }).click();
  37 |     await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  38 |   });
  39 | 
  40 |   test('2. User can log in', async () => {
  41 |     // We should already be on the login page from the previous test, 
  42 |     // but going explicitly handles edge cases.
  43 |     await page.goto('http://localhost:3000/login');
  44 | 
  45 |     await page.getByPlaceholder('name@example.com').fill(testEmail);
  46 |     await page.getByPlaceholder('••••••••').fill(testPassword);
  47 |     
  48 |     await page.locator('form').getByRole('button', { name: 'Log In' }).click();
  49 | 
  50 |     // Use waitForURL to handle initial Next.js compile delays
  51 |     await page.waitForURL(/.*\/marketplace/, { timeout: 30000 });
  52 |     await expect(page).toHaveURL(/.*\/marketplace/);
  53 |   });
  54 | 
  55 |   test('3. User can navigate to profile and edit their username', async () => {
  56 |     // The session is maintained from the previous test, so we are on /marketplace
  57 | 
  58 |     // Option A: Assuming there is a UI button to take them to the profile
  59 |     // await page.getByRole('link', { name: 'Profile' }).click(); 
  60 |     
  61 |     // Option B: Navigate directly if you haven't built the UI button yet
  62 |     await page.goto('http://localhost:3000/profile');
  63 | 
  64 |     await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();
  65 | 
  66 |     const firstNameInputContainer = page.locator('div').filter({ hasText: /^First Name$/ });
  67 |     await firstNameInputContainer.locator('input').fill('john');
  68 | 
  69 |     page.once('dialog', async (dialog) => {
  70 |       expect(dialog.message()).toBe('Profile successfully updated!');
  71 |       await dialog.accept();
  72 |     });
  73 | 
  74 |     await page.getByRole('button', { name: 'Save Changes' }).click();
  75 | 
  76 |     await expect(page.getByRole('heading', { name: /john/i })).toBeVisible();
  77 |   });
  78 | 
  79 | });
```