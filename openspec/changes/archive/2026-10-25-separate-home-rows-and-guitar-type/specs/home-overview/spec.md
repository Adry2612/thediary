# Spec Delta

## Purpose

Composes the home screen: the order of its sections, the separation between the quick-start routines and the repertoire, and how each row uses the available width.

## ADDED Requirements

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
