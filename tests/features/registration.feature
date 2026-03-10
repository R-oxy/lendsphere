Feature: User Registration
  As a new visitor to Lendsphere
  I want to create an account
  So that I can start borrowing or lending money on the platform

  Scenario Outline: Successful registration with a valid role
    Given I am on the registration page
    When I register as a "<role>" with valid details
    Then I should be redirected to the login page

    Examples:
      | role     |
      | Borrower |
      | Lender   |

  Scenario: Registration fails with an already registered email
    Given I am on the registration page
    When I register with an email that is already in use
    Then I should see an error message "Email already registered"
