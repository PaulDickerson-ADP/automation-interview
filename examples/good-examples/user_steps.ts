// GOOD EXAMPLE: Domain-focused step definitions
// This file is organized by user management domain concepts

import { Given, When, Then } from '@cucumber/cucumber';
import { Page } from 'playwright';

// Good: Reusable, domain-focused steps
Given('I am logged in as a user', async function (this: { page: Page }) {
  // Reusable across multiple features
  await this.page.goto('/login');
  await this.page.fill('[data-testid="username"]', 'testuser');
  await this.page.fill('[data-testid="password"]', 'password123');
  await this.page.click('[data-testid="login-button"]');
});

Given('I am on the user profile page', async function (this: { page: Page }) {
  await this.page.goto('/profile');
  await this.page.waitForLoadState('domcontentloaded');
});

// Good: Atomic, single-purpose steps
When('I update my name to {string}', async function (this: { page: Page }, newName: string) {
  await this.page.fill('[data-testid="name-field"]', newName);
});

When('I update my email to {string}', async function (this: { page: Page }, newEmail: string) {
  await this.page.fill('[data-testid="email-field"]', newEmail);
});

When('I save my profile changes', async function (this: { page: Page }) {
  await this.page.click('[data-testid="save-button"]');
});

// Good: Behavior-focused, not UI-coupled
Then('my profile should be updated successfully', async function (this: { page: Page }) {
  await this.page.waitForSelector('[data-testid="success-message"]');
});

Then('I should see my name as {string}', async function (this: { page: Page }, expectedName: string) {
  const displayedName = await this.page.textContent('[data-testid="display-name"]');
  if (displayedName !== expectedName) {
    throw new Error(`Expected name to be "${expectedName}" but was "${displayedName}"`);
  }
});

// Good: Declarative rather than imperative
Given('I have a user account', async function (this: { page: Page }) {
  // Abstract away the how, focus on the what
  // This could create a user via API, UI, or database
  // Implementation details are hidden
});

When('I change my contact information', async function (this: { page: Page }) {
  // Groups related actions logically without being too specific about UI
  await this.page.fill('[data-testid="phone-field"]', '555-1234');
  await this.page.fill('[data-testid="address-field"]', '123 Main St');
});