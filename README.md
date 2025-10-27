# Playwright + Cucumber.js Automation Interview Project

## Project Intent
This project is designed for interviewing candidates on their ability to write end-to-end (E2E) automation tests using Playwright and Cucumber.js. It provides:
- A working solution set (in `src/` and `features/`) for reference.
- A barebones starter set (in `starter/`) for candidates to implement from scratch.

Candidates are expected to:
- Implement missing logic in the starter files to automate a login scenario.
- Demonstrate best practices in page object modeling, Gherkin syntax, and step definitions.

## How to Run

### Solution (Reference Implementation)
1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the solution test:
   ```sh
   npm test
   ```
   (or)
   ```sh
   npx cucumber-js --require-module ts-node/register --require src/steps/**/*.ts features
   ```

### Starter (Candidate Implementation)
1. Implement the TODOs in `starter/pages/LoginPage.ts` and `starter/steps/sample.steps.ts`.
2. Run the starter test:
   ```sh
   npx cucumber-js --require-module ts-node/register --require starter/steps/**/*.ts starter/features
   ```

## Project Structure
- `features/`: Gherkin feature files (solution)
- `src/steps/`: Step definitions (solution)
- `src/pages/`: Page objects (solution)
- `starter/`: Starter files for candidate implementation

## Sample Scenario
- Login page test using Playwright and Cucumber.js

---
Replace selectors and URLs with your actual app details for a real test.
