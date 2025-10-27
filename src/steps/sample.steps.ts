import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { LoginPage } from '../pages/LoginPage';
import { chromium, Browser, Page } from 'playwright';

setDefaultTimeout(60000);

let browser: Browser;
let page: Page;
let loginPage: LoginPage;

Given('I am on the login page', async function () {
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
  loginPage = new LoginPage(page);
  await loginPage.goto();
});

When('I enter valid credentials', async function () {
  await loginPage.login('student', 'Password123');
});

Then('I should see the dashboard', async function () {
  await loginPage.assertDashboardVisible();
  await browser.close();
});
