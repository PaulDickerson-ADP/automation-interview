import { Page } from 'playwright';

export class LoginPage {
  constructor(private page: Page) {
    this.page.setDefaultTimeout(60000);
  }

  async goto() {
    await this.page.goto('https://practicetestautomation.com/practice-test-login/', { timeout: 60000 });
  }

  async login(username: string, password: string) {
    await this.page.fill('input#username', username);
    await this.page.fill('input#password', password);
    await this.page.click('button#submit');
  }

  async assertDashboardVisible() {
    await this.page.waitForSelector('h1', { state: 'visible', timeout: 60000 });
    const header = await this.page.textContent('h1');
    const body = await this.page.content();
    if (header !== 'Logged In Successfully') {
      throw new Error('Dashboard not visible or login failed');
    }
  }
}
