// BAD EXAMPLE: Feature-coupled step definitions
// This file is named after a specific feature instead of domain concepts

import { Given, When, Then } from '@cucumber/cucumber';
import { Page } from 'playwright';

// Anti-pattern: Feature-coupled step definitions
// These steps are too specific to the profile management feature
Given('I have a user profile and I am on the profile management page', async function (this: { page: Page }) {
  // This step is too specific and hard to reuse
  await this.page.goto('/profile-management');
  await this.page.fill('#username', 'testuser');
  await this.page.fill('#email', 'test@example.com');
});

// Anti-pattern: Conjunction steps
// This step combines multiple actions that should be separate
When('I update my name and email and phone number', async function (this: { page: Page }) {
  await this.page.fill('#name', 'John Doe');
  await this.page.fill('#email', 'john.doe@example.com');
  await this.page.fill('#phone', '555-1234');
});

// Anti-pattern: Feature-coupled and overly specific
Then('I should see my updated profile information displayed correctly on the profile management page', async function (this: { page: Page }) {
  await this.page.waitForSelector('.profile-updated-message');
  // Too specific to this particular feature
});

// Anti-pattern: UI-coupled step definition
Given('I click the blue "Edit Profile" button in the top navigation bar', async function (this: { page: Page }) {
  // Too specific about UI implementation details
  await this.page.click('.top-nav .blue-button[data-testid="edit-profile"]');
});

// Anti-pattern: Imperative steps instead of declarative
When('I click on the name field and clear it and type "Jane Smith"', async function (this: { page: Page }) {
  await this.page.click('#name');
  await this.page.fill('#name', '');
  await this.page.type('#name', 'Jane Smith');
});