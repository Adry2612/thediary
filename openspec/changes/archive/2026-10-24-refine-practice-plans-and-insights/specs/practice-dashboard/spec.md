# Spec Delta

## Purpose

Defines what the practice dashboard shows and how its summaries behave: practice volume over time, weekly and time-of-day patterns, calendar and skill summaries, and streak recognition.

## ADDED Requirements

### Requirement: The two time cards have the same size

The system SHALL place the "Ritmo de práctica" card and the "Cuándo practicas" card in the same responsive row, SHALL give both the same width and height on wide viewports, and SHALL keep each full-width and equal when the row stacks on narrow viewports.

#### Scenario: Wide viewport
- **WHEN** the dashboard is shown at a wide viewport
- **THEN** the two cards start on the same row and share the same width and height

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown at a narrow viewport and the row stacks
- **THEN** both cards take the full available width and stay aligned without horizontal overflow

#### Scenario: Existing analytics stay unchanged
- **WHEN** the two cards are compared before and after the layout change
- **THEN** each keeps the same chart, period selector, values and empty state as before

### Requirement: The dashboard separates volume from pattern

The system SHALL describe "Ritmo de práctica" as the evolution of practised time over the selected period and "Cuándo practicas" as the weekly and time-band pattern across the full history, so the two cards do not present themselves as the same insight.

#### Scenario: The volume card explains its period
- **WHEN** the user reads the "Ritmo de práctica" card
- **THEN** its copy states that it shows time practised per day, week or month according to the selected period

#### Scenario: The pattern card explains its scope
- **WHEN** the user reads the "Cuándo practicas" card
- **THEN** its copy states that it distributes the full history by weekday and time of day

#### Scenario: Changing the period
- **WHEN** the user changes the period of "Ritmo de práctica"
- **THEN** its copy follows the new period while "Cuándo practicas" keeps describing the full-history pattern

#### Scenario: Both languages
- **WHEN** the dashboard is shown in Spanish or English
- **THEN** the two descriptions keep the volume-versus-pattern distinction in that language
