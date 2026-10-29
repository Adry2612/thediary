# home-overview Specification

## Purpose
Composes the home screen: the order of its sections, the separation between the quick-start routines and the repertoire, and how each row uses the available width.

## Requirements

### Requirement: The home screen gives routines and repertoire their own rows

The system SHALL place the quick-start routines and the recent repertoire in two separate full-width rows, with the routines above the repertoire, on every viewport. It SHALL NOT place the two sections side by side and SHALL keep each section's header, link, loading state and empty state.

#### Scenario: Wide viewport
- **WHEN** the home screen is shown on a wide viewport
- **THEN** the quick-start routines occupy one full-width row and the repertoire occupies the next full-width row, with no side-by-side columns

#### Scenario: Narrow viewport
- **WHEN** the home screen is shown on a narrow viewport
- **THEN** both sections stay stacked at full width without horizontal overflow

#### Scenario: Repertoire row width
- **WHEN** the repertoire row has the full width
- **THEN** its cards form a readable grid that uses the available width, with two columns on narrow screens, three on medium screens and four on wide screens

#### Scenario: Routines row width
- **WHEN** the routines row has the full width
- **THEN** its routine cards keep a readable responsive grid instead of stretching to a single oversized column

#### Scenario: Empty and loading states
- **WHEN** either section has no items or is still loading
- **THEN** its own message and its link to the corresponding view stay inside that section's row

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
