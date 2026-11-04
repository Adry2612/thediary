# Spec Delta

## ADDED Requirements

### Requirement: Home repeats the daily reminder when push is unavailable

The system SHALL show the daily reminder on the start screen when the device cannot use system notifications —guest session, unsupported browser, blocked permission or no active subscription—, SHALL use the same enabled reasons and chosen time as the system notification, and SHALL NOT show it while push is available.

#### Scenario: A guest after the chosen time
- **WHEN** a guest opens the start screen after the chosen time and a reminder reason applies
- **THEN** the screen shows the daily reminder as a row

#### Scenario: Push is active
- **WHEN** the device has an active push subscription and notifications are allowed
- **THEN** the start screen does not repeat the reminder

#### Scenario: Before the chosen time
- **WHEN** the user opens the start screen before the chosen time
- **THEN** the reminder row is not shown

#### Scenario: Nothing applies
- **WHEN** no enabled reason applies
- **THEN** the start screen shows no reminder row

#### Scenario: The practice is done
- **WHEN** the user saves today's practice and no other reason applies
- **THEN** the reminder row disappears without a reload

#### Scenario: A narrow viewport
- **WHEN** the start screen is shown on a phone
- **THEN** the reminder row stays inside its section without horizontal overflow

### Requirement: The in-app reminder is dismissed for the rest of the day

The system SHALL show the in-app reminder at most once per local day, SHALL let the user dismiss it, SHALL keep it dismissed for the rest of that local day, and SHALL offer it again on a later day only if a reason still applies.

#### Scenario: Dismissing the row
- **WHEN** the user dismisses the reminder row
- **THEN** it stays hidden for the rest of the day, including after a reload

#### Scenario: A new day
- **WHEN** the next local day has an applicable reason and the user has not dismissed it yet
- **THEN** the reminder row is shown again after the chosen time

#### Scenario: A new reason appears
- **WHEN** the user had dismissed the row and a string change becomes due later that same day
- **THEN** the dismissed row stays hidden until the next local day
