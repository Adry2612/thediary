# Spec Delta

## ADDED Requirements

### Requirement: The options of a select stay inside their dialog

The system SHALL place the options list of a select against the container it is rendered into —not against the viewport— and SHALL keep the whole list inside the dialog that holds the control and inside the viewport, so every option is readable and reachable with the pointer.

#### Scenario: A select inside an animated dialog
- **WHEN** the user opens a select inside a dialog whose panel has an entrance transform
- **THEN** the list appears under its control, aligned with it, with both its left and right edges inside the dialog

#### Scenario: No room below
- **WHEN** the control sits close to the bottom of the dialog
- **THEN** the list opens upward and stays fully visible inside the dialog

#### Scenario: A narrow screen
- **WHEN** the dialog is open on a 375 px wide screen
- **THEN** the list keeps the width of its control and none of it falls outside the dialog

#### Scenario: A select on a page
- **WHEN** the user opens a select that is not inside a dialog
- **THEN** the list still appears aligned with its control and inside the viewport

#### Scenario: Every option is reachable
- **WHEN** the list is open
- **THEN** every option of the list can be read and clicked without the dialog clipping it
