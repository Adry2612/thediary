# Spec Delta

## ADDED Requirements

### Requirement: Home warns only when a string change is near

The system SHALL show a single line on the home screen naming the most urgent guitar only when its strings are due or due soon, SHALL link that line to the Tools screen, and SHALL NOT add a row when no guitar needs attention.

#### Scenario: A guitar is due
- **WHEN** a guitar has reached its days or hours interval
- **THEN** the home screen shows one line with the guitar's name, that its strings are due, and a link to Tools

#### Scenario: A guitar is due soon
- **WHEN** no guitar is due but one is close to an interval
- **THEN** the line names it and the remaining days or hours

#### Scenario: Several guitars
- **WHEN** more than one guitar needs attention
- **THEN** the line names only the most urgent one

#### Scenario: Everything is up to date
- **WHEN** no guitar is due or due soon
- **THEN** the home screen shows no string line at all

#### Scenario: No guitars
- **WHEN** the user has no guitars
- **THEN** the home screen shows no string line and does not ask for equipment

#### Scenario: Narrow viewport
- **WHEN** the home screen is shown on a phone
- **THEN** the line stays inside its row without horizontal overflow
