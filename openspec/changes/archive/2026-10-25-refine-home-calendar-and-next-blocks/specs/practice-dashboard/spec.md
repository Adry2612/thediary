# Spec Delta

## ADDED Requirements

### Requirement: The annual calendar shows the selected day's summary below its grid

The system SHALL show the practice day summary in a fixed panel below the annual calendar grid, SHALL update it when the pointer or keyboard focus enters a day or a touch selects one, and SHALL keep every day cell free of an overlapping card. The panel MUST stay interactive, MUST keep the last consulted day when the pointer leaves, and MUST NOT close when the page scrolls.

#### Scenario: Opening the calendar
- **WHEN** the annual calendar is shown
- **THEN** the panel shows the latest practised day, or today when the history has no sessions

#### Scenario: Hovering another day
- **WHEN** the pointer enters a day of the annual calendar
- **THEN** the panel updates immediately to that day without covering any day cell

#### Scenario: Leaving the calendar
- **WHEN** the pointer leaves the day and the calendar
- **THEN** the panel keeps showing the last consulted day

#### Scenario: Keyboard focus
- **WHEN** a day receives keyboard focus
- **THEN** the panel updates to that day and stays visible

#### Scenario: Another day stays clickable
- **WHEN** the panel is showing a day and the pointer enters a neighbouring day
- **THEN** the neighbouring day can be hovered and clicked normally

#### Scenario: Touch
- **WHEN** the user taps a day on a touch screen
- **THEN** the panel updates to that day without navigating, and a second tap on the same day opens its detail

#### Scenario: Scrolling the session list
- **WHEN** the panel has more sessions than fit and the user scrolls its internal list
- **THEN** the selected day does not change

#### Scenario: Scrolling the page
- **WHEN** the page scrolls or the viewport is resized
- **THEN** the panel stays visible with the same day

#### Scenario: A day without practice
- **WHEN** the selected day has no saved practice
- **THEN** the panel shows that day's empty state

## MODIFIED Requirements

### Requirement: The day summary can be entered with the pointer

The system SHALL keep the weekly summary's hover summary open while the pointer moves from the day to the summary itself, so the user can read or scroll it, and SHALL close it only after the pointer leaves both.

#### Scenario: Moving the pointer onto the summary
- **WHEN** the weekly summary is open and the pointer leaves the day but enters the summary
- **THEN** the summary stays open and the user can interact with it

#### Scenario: Leaving the summary
- **WHEN** the pointer leaves the summary without entering another day
- **THEN** the summary closes after a short grace period

#### Scenario: Moving to another day
- **WHEN** the pointer moves from one day to another day with practice
- **THEN** the summary shows the new day instead of closing and reopening

#### Scenario: No practice that day
- **WHEN** the pointer enters a day without saved practice
- **THEN** the summary shows that day's empty state and can still be entered

### Requirement: The day summary closes when the page moves

The system SHALL close the weekly summary's floating day summary when the page scrolls or the viewport is resized, and SHALL NOT close it when the user scrolls the summary's own session list.

#### Scenario: Scrolling the page
- **WHEN** the weekly summary's floating card is open and the page scrolls vertically or horizontally
- **THEN** the card closes instead of remaining pinned to the old screen position

#### Scenario: Scrolling inside the summary
- **WHEN** the card has more sessions than fit and the user scrolls its internal list
- **THEN** the card stays open

#### Scenario: Resizing the window
- **WHEN** the card is open and the viewport is resized
- **THEN** the card closes

#### Scenario: Keyboard dismissal
- **WHEN** the card is open and the user presses Escape
- **THEN** the card closes

#### Scenario: Keyboard focus
- **WHEN** the user reaches a practice day with the keyboard
- **THEN** the card opens and stays open while that day keeps the focus

## REMOVED Requirements

### Requirement: The annual calendar keeps the day summary on its day

**Reason**: The floating card covered neighbouring days and prevented them from being selected; the annual calendar now uses a fixed summary below the grid.

**Migration**: Use the summary panel below the annual calendar; the weekly summary keeps its floating card and its pointer behaviour.
