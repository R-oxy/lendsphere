Feature: User Login
  As a registered user of Lendsphere
  I want to log in with my credentials
  So that I can access my dashboard and manage my account

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter a valid email and password
    And I click the Sign in button
    Then I should be redirected to the dashboard

  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter an invalid email and password
    And I click the Sign in button
    Then I should remain on the login page
