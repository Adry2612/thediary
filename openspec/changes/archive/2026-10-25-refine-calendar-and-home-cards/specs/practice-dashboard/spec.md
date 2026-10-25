# Spec Delta

## ADDED Requirements

### Requirement: The annual calendar previews a day in a non-blocking card

The system SHALL show the annual calendar's day summary in a floating card next to the day under the pointer or keyboard focus, SHALL let pointer events pass through the card so the day underneath it stays hoverable and clickable, and SHALL keep the preview compact: date, session count, total time and up to three sessions, with a count of the sessions that do not fit.

#### Scenario: Opening a day
- **WHEN** the pointer enters a day of the annual calendar
- **THEN** its summary card opens next to that day without waiting for a dwell

#### Scenario: Moving across the card
- **WHEN** the pointer leaves the day and crosses the area occupied by the card
- **THEN** the day underneath the pointer receives the hover and the card updates to that day instead of keeping the previous one

#### Scenario: Choosing a day under the card
- **WHEN** the pointer clicks a day whose cell is covered by the open card
- **THEN** that day's detail opens normally

#### Scenario: Keyboard focus
- **WHEN** a day receives keyboard focus
- **THEN** the card opens next to it and describes that day until the focus moves

#### Scenario: Many sessions in a day
- **WHEN** the day has more than three sessions
- **THEN** the card lists the first three and shows how many more sessions that day has

#### Scenario: A day without practice
- **WHEN** the pointer or focus reaches a day without saved practice
- **THEN** the card shows that day's empty state and still lets the surrounding days be used

### Requirement: The annual preview closes when the day is no longer consulted

The system SHALL close the annual calendar's preview card after the pointer leaves the calendar, when the page scrolls, when the viewport is resized, when Escape is pressed, or when a touch user taps outside the calendar, and SHALL keep the touch two-tap rule: the first tap previews a day, the second tap on the same day opens its detail.

#### Scenario: Leaving the calendar
- **WHEN** the pointer leaves the day and the calendar without entering another day
- **THEN** the card closes after a short grace period

#### Scenario: Scrolling the page
- **WHEN** the page or the calendar strip scrolls while the card is open
- **THEN** the card closes instead of staying pinned to the old position

#### Scenario: Resizing or Escape
- **WHEN** the viewport is resized or the user presses Escape
- **THEN** the card closes

#### Scenario: First touch
- **WHEN** the user taps a day with practice on a touch screen
- **THEN** the card previews that day without navigating

#### Scenario: Second touch
- **WHEN** the user taps the same day again while its card is open
- **THEN** that day's detail opens

#### Scenario: Tapping outside
- **WHEN** the user taps outside the calendar while a preview is open
- **THEN** the card closes and the armed day is cleared

## REMOVED Requirements

### Requirement: The annual calendar shows the selected day's summary below its grid

**Reason**: The fixed panel below the grid is not the interaction the user wants; the original card next to the day returns, now without blocking the days under it.

**Migration**: Use the floating preview card. The panel and its persistent selected day disappear; the weekly summary keeps its existing interactive floating card.
