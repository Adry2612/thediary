# Spec Delta

## ADDED Requirements

### Requirement: The annual calendar's day summary can be opened with a tap

On a coarse pointer, the system SHALL open a day's summary on the first tap without navigating, SHALL open the day detail on a second tap on that same day, and SHALL move the summary when another day is tapped. Keyboard and assistive-technology activation SHALL open the day detail directly, and the pointer behaviour SHALL stay as it is.

#### Scenario: First tap on a day
- **WHEN** the user taps a day with saved practice on a touch screen
- **THEN** that day's summary opens and the page does not navigate

#### Scenario: Second tap on the open day
- **WHEN** the summary is open for a day and the user taps that same day again
- **THEN** the system opens that day's detail

#### Scenario: Tapping another day
- **WHEN** a summary is open and the user taps a different day
- **THEN** the summary moves to the new day without navigating

#### Scenario: Tapping a day without practice
- **WHEN** the user taps a day without saved practice
- **THEN** the summary shows that day's empty state and the page does not navigate

#### Scenario: Keyboard or assistive activation
- **WHEN** a day is activated from the keyboard or by an assistive technology
- **THEN** the day detail opens directly, without the extra tap

#### Scenario: Mouse keeps its behaviour
- **WHEN** the pointer hovers a day and then clicks it
- **THEN** the summary opens on hover and the click opens the day detail, as before
