Feature: Profile Management

  Scenario: Update user profile information and verify changes and check notifications
    Given I have a user profile and I am on the profile management page
    When I update my name and email and phone number
    And I click the blue "Edit Profile" button in the top navigation bar
    Then I should see my updated profile information displayed correctly on the profile management page
    And I should see a green success notification in the top right corner

  Scenario: Navigate through profile management using specific UI elements
    Given I click on the "Profile" tab in the left sidebar
    And I see the profile form with a white background and blue borders
    When I click on the name field and clear it and type "Jane Smith"
    And I scroll down to the bottom of the page
    And I click the green "Save Changes" button with the checkmark icon
    Then I should see the success message appear with a fade-in animation

  Scenario: Validate profile data persistence after browser refresh
    Given I am logged in as user "testuser@example.com" with password "Test123!"
    And I navigate to "https://example.com/profile/edit" via URL bar
    And I wait for the page to load completely (all network requests finished)
    When I change the first name from "John" to "Johnny" using keyboard input
    And I change the last name from "Doe" to "Smith" by selecting all text and typing
    And I press Ctrl+S to save the form
    And I refresh the browser using F5 key
    Then I should verify that the DOM contains "Johnny" in the #firstName input field
    And I should verify that the DOM contains "Smith" in the #lastName input field

  Scenario: Profile management workflow with account validation and email confirmation
    Given I have an active account with premium subscription status
    And I have verified my email address through the confirmation link
    And I have completed the initial profile setup wizard
    When I access the profile management dashboard from the main menu
    And I modify my profile information including personal and contact details
    And I submit the changes and wait for the confirmation dialog
    Then I should receive an email notification about the profile update
    And my account status should remain as premium subscriber
    And my profile completion percentage should be recalculated and displayed