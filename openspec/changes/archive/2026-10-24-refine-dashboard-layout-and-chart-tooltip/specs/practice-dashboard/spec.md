# Spec Delta

## ADDED Requirements

### Requirement: The dashboard lays its insight cards in equal pairs

The system SHALL place the practice rhythm card and the skill balance in the same responsive row, SHALL place the guitar balance and tempo progress in the next row, and SHALL give the two cards of each row the same width and height on wide viewports.

#### Scenario: Wide viewport
- **WHEN** the dashboard is shown at a wide viewport
- **THEN** the rhythm card and the skill balance start on the same row with equal width and height, and the guitar balance and tempo progress do the same on the following row

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown at a narrow viewport and the rows stack
- **THEN** every card takes the full available width without horizontal overflow

#### Scenario: Period summary inside the narrower card
- **WHEN** the rhythm card shares its row with the skill balance
- **THEN** its period summary stays fully readable, with its figures arranged in two columns

### Requirement: The rhythm chart tooltip details each bucket

The system SHALL show, for each practised bucket of the practice rhythm chart, a card with its label, total time, number of sessions, average time per session and the percentage it represents of the best day, week or month in the selected period.

#### Scenario: Hovering a practised bucket
- **WHEN** the user points at a bucket that has practice
- **THEN** the card shows the bucket label, its total time, its session count, the average time per session and its percentage of the best bucket in the period

#### Scenario: Keyboard focus
- **WHEN** the user focuses a practised bucket with the keyboard
- **THEN** the same detailed card appears

#### Scenario: Best bucket of the period
- **WHEN** the bucket is the one with the most practice in the selected period
- **THEN** the comparison reads as 100 % of the best day, week or month according to the selected period

#### Scenario: Bucket without practice
- **WHEN** the user points at a bucket without practice
- **THEN** no card is shown

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the card's best-unit comparison uses the matching day, week or month wording
