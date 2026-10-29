# Spec Delta

## MODIFIED Requirements

### Requirement: Every screen shares the same page shell

The system SHALL lay out every app screen inside one page shell that uses the same content column, the same horizontal gutters and the same vertical rhythm, SHALL keep that shell while the screen loads, SHALL NOT shift the side margins or the header when the user navigates from one screen to another, and SHALL widen the column only once on ultrawide viewports before it stops growing.

#### Scenario: Moving between screens
- **WHEN** the user navigates between the start, the dashboard, the tools section, the practice screen, the repertoire, the licks, the recordings, the settings and the account
- **THEN** the content column and its side margins stay in the same place on every screen

#### Scenario: A screen that is still loading
- **WHEN** a screen shows its loading state before its data is ready
- **THEN** the loading state uses the same shell, so nothing moves when the content arrives

#### Scenario: A narrow viewport
- **WHEN** the app is shown on a phone
- **THEN** every screen keeps the same side gutter and no content touches the edge of the viewport

#### Scenario: A wide viewport
- **WHEN** the app is shown on a wide viewport
- **THEN** every screen keeps the same maximum column width instead of widening per screen

#### Scenario: An ultrawide viewport
- **WHEN** the app is shown on a monitor wider than 1536 px
- **THEN** the column grows to 1536 px, keeps its side gutters and stops growing instead of stretching with the screen

#### Scenario: Narrow content inside the shell
- **WHEN** a screen holds a single form or control set that reads better narrow
- **THEN** that content is capped inside the shared column and the side margins of the screen do not change
