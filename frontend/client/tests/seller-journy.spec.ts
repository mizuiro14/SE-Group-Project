import { test, expect, type Page, request } from '@playwright/test';

// Mark as serial so they run in order using the same context.
test.describe.serial('End-to-End User Journey (Separated)', () => {
  
  let page: Page;
  
  // Seller variables
  let testSellerEmail: string;
  const testPassword = 'Password123!';
  const productName = `Playwright Cola ${Date.now()}`; 
  
  // Buyer variables
  let testBuyerEmail: string;

  // Set up a single shared browser page BEFORE the tests start
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const timestamp = Date.now();
    testSellerEmail = `testseller_${timestamp}@example.com`;
    testBuyerEmail = `testbuyer_${timestamp}@example.com`;
  });

  // Clean up the page AFTER all tests are done
  test.afterAll(async () => {
    const apiContext = await request.newContext();
    
    // Delete both test users to keep DB clean
    await apiContext.delete(`http://localhost:5000/api/users/${testSellerEmail}`);
    await apiContext.delete(`http://localhost:5000/api/users/${testBuyerEmail}`);
    
    await page.close();
  });

  // ==========================================
  // ---------- SELLER JOURNEY ----------------
  // ==========================================

  test('1. User can sign up as a Seller', async () => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByLabel('Seller').check();

    await page.getByPlaceholder('John Doe').fill('Test Seller');
    await page.getByPlaceholder('e.g., +63 912 345 6789').fill('09123456789');
    await page.getByPlaceholder('e.g., Jaro, Iloilo').fill('Test Branch Location'); 
    await page.getByPlaceholder('name@example.com').fill(testSellerEmail);
    await page.getByPlaceholder('Create a password').fill(testPassword);
    
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Account Created')).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Proceed to Login' }).click();
  });

  test('2. User can log in as Seller', async () => {
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();

    await page.getByPlaceholder('name@example.com').fill(testSellerEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);
    
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL(/.*\/marketplace/, { timeout: 30000 });
    await expect(page).toHaveURL(/.*\/marketplace/);
  });

  test('3. Seller creates a product with a stock of 20', async () => {
     await page.getByRole('button', { name: 'Add New Items' }).click();
     await expect(page.getByRole('heading', { name: /Add New Marketplace Item/i })).toBeVisible();

     await page.getByPlaceholder('e.g. Organic Apple Juice').fill(productName);
     await page.locator('select').first().selectOption('Juice');
     await page.locator('input[type="number"]').first().fill('15.50');
     await page.locator('input[type="number"]').last().fill('20');

     await page.getByRole('button', { name: 'Publish Product' }).click();
     await expect(page.getByRole('heading', { name: /Add New Marketplace Item/i })).not.toBeVisible();
     await expect(page.getByText(productName)).toBeVisible();
  });

  test('4. Seller goes to stock page and adds 10 stock', async () => {
     await page.goto('http://localhost:3000/stock');
     await expect(page.getByRole('heading', { name: /Inventory Visibility/i })).toBeVisible();

     await page.getByRole('button', { name: '+ Add Stock' }).click();
     await expect(page.getByRole('heading', { name: 'Add Stock' })).toBeVisible();

     await page.getByPlaceholder('Type to filter products...').fill(productName);
     const exactLabel = await page.locator('select option', { hasText: productName }).textContent();
     await page.locator('select').selectOption({ label: exactLabel?.trim() || '' });

     const amountInput = page.locator('input[type="number"]');
     await amountInput.fill('10');

     await page.getByRole('button', { name: 'Publish Stock' }).click();
     await expect(page.getByRole('heading', { name: 'Add Stock' })).not.toBeVisible();
     await expect(page.getByText('30 units', { exact: true }).first()).toBeVisible();
  });

  test('5. Seller can edit their profile and log out', async () => {
    await page.goto('http://localhost:3000/profile');

    const firstNameInputContainer = page.locator('div').filter({ hasText: /^First Name$/ });
    await firstNameInputContainer.locator('input').fill('john');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Profile successfully updated!');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.locator('h2', { hasText: /john/i })).toBeVisible();

    // Now log out the seller!
    await page.getByRole('button', { name: 'Log Out' }).click();
    await page.waitForURL(/.*\/login/); 
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  });

  // ==========================================
  // ---------- BUYER JOURNEY -----------------
  // ==========================================

  test('6. User can sign up as a Buyer', async () => {
    await page.goto('http://localhost:3000/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Ensure Buyer role is selected (often default, but ensuring it)
    await page.getByLabel('Buyer').check();

    await page.getByPlaceholder('John Doe').fill('Test Buyer');
    await page.getByPlaceholder('e.g., +63 912 345 6789').fill('09123456789');
    // Note: No location needed for buyers
    await page.getByPlaceholder('name@example.com').fill(testBuyerEmail);
    await page.getByPlaceholder('Create a password').fill(testPassword);
    
    await page.locator('form').getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Account Created')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Proceed to Login' }).click();
  });

  test('7. User can log in as Buyer', async () => {
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();

    await page.getByPlaceholder('name@example.com').fill(testBuyerEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);
    
    await page.locator('form').getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL(/.*\/marketplace/, { timeout: 30000 });
    await expect(page).toHaveURL(/.*\/marketplace/);
  });

  test('8. Buyer can purchase 10 units of the Seller product', async () => {
    // 1. Locate the exact product in the table and click it to open the details modal
    // Note: since it's a dynamic table row, we find the row that contains our product name
    const productRow = page.locator('tr', { hasText: productName });
    await productRow.click();

    // 2. In the details pane (sidebar), click the "Buy Now" button
    await page.getByRole('button', { name: 'Buy Now' }).click();

    // 3. The Buy Modal appears. Change the quantity input.
    // The input for quantity has a max attribute. 
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.fill('10');

    // Handle the browser alert that appears upon successful purchase
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Successfully purchased 10');
      await dialog.accept();
    });

    // 4. Click Confirm Buy
    await page.getByRole('button', { name: 'Confirm Buy' }).click();

    // 5. The modal should close
    await expect(page.getByRole('button', { name: 'Confirm Buy' })).not.toBeVisible();
    
    // Optional: The stock of the product in the table should now say "20 Low Stock"
    await expect(productRow).toContainText('20 Low Stock');
  });

});