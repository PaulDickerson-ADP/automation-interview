import { Given, When, Then } from '@cucumber/cucumber';
import { Page } from 'playwright';

Given('I have a user profile and I am on the profile management page', async function (this: { page: Page }) {
  await this.page.goto('/profile-management');
  await this.page.fill('#username', 'testuser');
  await this.page.fill('#email', 'test@example.com');
});

When('I update my name and email and phone number', async function (this: { page: Page }) {
  await this.page.fill('#name', 'John Doe');
  await this.page.fill('#email', 'john.doe@example.com');
  await this.page.fill('#phone', '555-1234');
});

Then('I should see my updated profile information displayed correctly on the profile management page', async function (this: { page: Page }) {
  await this.page.waitForSelector('.profile-updated-message');
});

Given('I click the blue "Edit Profile" button in the top navigation bar', async function (this: { page: Page }) {
  await this.page.click('.top-nav .blue-button[data-testid="edit-profile"]');
});

When('I click on the name field and clear it and type "Jane Smith"', async function (this: { page: Page }) {
  await this.page.click('#name');
  await this.page.fill('#name', '');
  await this.page.type('#name', 'Jane Smith');
});