# Spec Delta

## MODIFIED Requirements

### Requirement: A nested view shows the way back

The system SHALL give every view that hangs off another one a way back marked with a left arrow, naming the view it returns to, and placed before the rest of the content of that view. A way back that navigates SHALL be a link, and one that returns to the previous state of the same screen MAY be a control.

#### Scenario: The repertoire file
- **WHEN** the user opens a repertoire item
- **THEN** the first thing on the page is the way back to the repertoire

#### Scenario: A new repertoire item
- **WHEN** the user opens the dialog that adds an item to the repertoire
- **THEN** the dialog offers a close control that returns to the repertoire without saving, and no back arrow to a separate creation page exists

#### Scenario: A practiced day
- **WHEN** the user opens the detail of a practiced day
- **THEN** the way back to the dashboard is there

#### Scenario: The routine designer
- **WHEN** the user is designing a routine on the practice screen
- **THEN** the way back to the routines is there
