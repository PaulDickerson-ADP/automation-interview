import { Given, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';

setDefaultTimeout(5000);

let browser: Browser;

Given('I am on the login page', async function () {
  throw new Error('Intentional failure for testing');
});
