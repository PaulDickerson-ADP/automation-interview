Feature: User Profile Management (GOOD EXAMPLE)
  # Good: Business-focused, readable scenarios

  Scenario: User updates their profile information
    Given I am logged in as a user
    And I am on the user profile page
    When I update my name to "Jane Doe"
    And I update my email to "jane.doe@example.com"
    And I save my profile changes
    Then my profile should be updated successfully
    And I should see my name as "Jane Doe"

  Scenario: User changes contact information
    Given I am logged in as a user
    And I am on the user profile page
    When I change my contact information
    And I save my profile changes
    Then my profile should be updated successfully

  # Good: Focused on business value, not implementation
  Scenario: Profile data persists after session
    Given I have a user account
    And I have updated my profile information
    When I log out and log back in
    Then my profile information should be preserved

  # Good: Uses parameters for reusability
  Scenario Outline: User updates different profile fields
    Given I am logged in as a user
    And I am on the user profile page
    When I update my <field> to "<value>"
    And I save my profile changes
    Then my profile should be updated successfully

    Examples:
      | field | value                |
      | name  | John Smith          |
      | email | john.smith@test.com |
      | phone | 555-9876           |

  # Good: Business rule focused
  Scenario: User cannot save profile with invalid email
    Given I am logged in as a user
    And I am on the user profile page
    When I update my email to "invalid-email"
    And I attempt to save my profile changes
    Then I should see a validation error
    And my profile should not be updated