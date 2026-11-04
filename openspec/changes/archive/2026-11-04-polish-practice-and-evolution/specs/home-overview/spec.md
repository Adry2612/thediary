# Spec Delta

## ADDED Requirements

### Requirement: The weekly routine planner gives every day the same size

The system SHALL lay the seven weekday cards of the weekly routine planner in one grid where every card has the same height, padding and select width at every breakpoint, whether or not it has a routine assigned and whether its routine name is short or long.

#### Scenario: Every day has a routine
- **WHEN** the user assigns a routine to each of the seven days
- **THEN** the seven cards share one height and their selects line up

#### Scenario: Some days are empty
- **WHEN** only some days have a routine
- **THEN** the empty days keep the same card height and select width as the assigned ones

#### Scenario: A long routine name
- **WHEN** an assigned routine has a long name
- **THEN** its select truncates inside the card without making that card taller or wider than the rest

#### Scenario: A narrow viewport
- **WHEN** the planner is shown on a phone
- **THEN** the cards keep equal size in the smaller column count without horizontal overflow

### Requirement: The home screen carries no reminder banners

The system SHALL deliver practice, string and inactivity reminders only as system notifications and SHALL NOT render an in-app reminder row, banner or notice on the start screen. The existing single string-change line SHALL keep working.

#### Scenario: The chosen reminder time passes
- **WHEN** the user opens the start screen after the reminder time with a pending practice
- **THEN** the screen shows no reminder row

#### Scenario: Push is unavailable
- **WHEN** the device is a guest session, an unsupported browser or has notifications blocked
- **THEN** the start screen still shows no in-app reminder row

#### Scenario: The string line is not a reminder banner
- **WHEN** a guitar needs a string change
- **THEN** the existing single string-change line still appears and links to Tools

#### Scenario: Nothing is pending
- **WHEN** no reminder reason applies
- **THEN** the start screen is unchanged and shows no reminder elements
