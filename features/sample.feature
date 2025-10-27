Feature: Sample login
  Scenario: User logs in successfully
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
