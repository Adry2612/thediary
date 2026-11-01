# Spec Delta

## ADDED Requirements

### Requirement: The licks library is a section of its own in the main navigation

The system SHALL list the licks library in the main navigation, SHALL open it from both the desktop and the mobile menus, and SHALL mark it as the current section while the user is inside it, including its nested lick pages.

#### Scenario: Reaching the licks library
- **WHEN** the user activates the licks entry in the main navigation
- **THEN** the app opens the licks library

#### Scenario: The current section is marked
- **WHEN** the user is on the licks library or on one of its licks
- **THEN** the navigation marks the licks section as current

#### Scenario: Reaching it from the mobile menu
- **WHEN** the user opens the mobile navigation
- **THEN** the licks entry is listed and closes the menu when activated
