import { Given, When, Then } from '@cucumber/cucumber';
import { Page } from 'playwright';

Given('I am logged in as a user', async function (this: { page: Page }) {
  await this.page.goto('/login');
  await this.page.fill('[data-testid="username"]', 'testuser');
  await this.page.fill('[data-testid="password"]', 'password123');
  await this.page.click('[data-testid="login-button"]');
});

Given('I am on the user profile page', async function (this: { page: Page }) {
  await this.page.goto('/profile');
  await this.page.waitForLoadState('domcontentloaded');
});

When('I update my name to {string}', async function (this: { page: Page }, newName: string) {
  await this.page.fill('[data-testid="name-field"]', newName);
});

When('I update my email to {string}', async function (this: { page: Page }, newEmail: string) {
  await this.page.fill('[data-testid="email-field"]', newEmail);
});

When('I save my profile changes', async function (this: { page: Page }) {
  await this.page.click('[data-testid="save-button"]');
});

Then('my profile should be updated successfully', async function (this: { page: Page }) {
  await this.page.waitForSelector('[data-testid="success-message"]');
});

Then('I should see my name as {string}', async function (this: { page: Page }, expectedName: string) {
  const displayedName = await this.page.textContent('[data-testid="display-name"]');
  if (displayedName !== expectedName) {
    throw new Error(`Expected name to be "${expectedName}" but was "${displayedName}"`);
  }
});

Given('I have a user account', async function (this: { page: Page }) {
  // Implementation details hidden - could use API, UI, or database
});

When('I change my contact information', async function (this: { page: Page }) {
  await this.page.fill('[data-testid="phone-field"]', '555-1234');
  await this.page.fill('[data-testid="address-field"]', '123 Main St');
});