# Playwright + Cucumber.js Automation Interview Project

## Purpose
This app is designed to assess a candidate's ability to write end-to-end (E2E) automation tests using Playwright and Cucumber.js. Candidates should demonstrate their skills by creating automated tests against the following practice site:

**Test URL:** [https://practicetestautomation.com/practice/](https://practicetestautomation.com/practice/)

## Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

## Setup & Installation

1. Clone this repository and navigate to the project directory

2. Install dependencies:
   ```sh
   npm install
   ```

3. Install Playwright browsers:
   ```sh
   npx playwright install
   ```

4. Run the sample test (will fail initially as it's a template):
   ```sh
   npm test
   ```

## Running Tests

- **Run all tests:** `npm test`
- **Run specific feature:** `npm test -- --name "Login"`
- **Check code quality:** `node anti-pattern-checker.js`

## Project Structure
- `features/`: Contains Gherkin feature files that describe test scenarios in plain language.
- `src/steps/`: Step definitions implementing the steps from feature files using Playwright.
- `src/pages/`: Page Object Model (POM) classes encapsulating selectors and actions for each page under test.
- `examples/`: Anti-pattern examples showing common mistakes vs. best practices.
- `anti-pattern-checker.js`: Utility script for checking code anti-patterns.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project dependencies and scripts.

## Candidate Instructions
- Write E2E tests using Playwright and Cucumber.js for the provided practice site.
- Organize your tests using the Page Object Model in `src/pages/`.
- Add new feature files to `features/` and corresponding step definitions to `src/steps/`.
- Follow best practices for maintainable and readable automation code.

## Sample Scenario
- Login page test using Playwright and Cucumber.js

---
For this exercise, use the provided practice site URL. Update selectors and steps as needed to match the site's UI.

## Candidate Instructions
- Write E2E tests using Playwright and Cucumber.js for the provided practice site.
- Organize your tests using the Page Object Model in `src/pages/`.
- Add new feature files to `features/` and corresponding step definitions to `src/steps/`.
- Follow best practices for maintainable and readable automation code.

## Sample Scenario
- Login page test using Playwright and Cucumber.js

---
For this exercise, use the provided practice site URL. Update selectors and steps as needed to match the site's UI.
