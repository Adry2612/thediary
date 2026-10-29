# pwa-mobile-shell Specification

## Purpose
Keeps the installed app behaving like a native mobile app: it respects the device's safe areas, never paints desktop scrollbars, never scrolls sideways, and never zooms the page on its own when a control receives focus.

## Requirements

### Requirement: The header keeps clear of the device status bar

The system SHALL declare a viewport that extends under the device cutouts (`viewport-fit=cover`) and SHALL reserve the top safe-area inset above the header content, so the app name and the menu button stay below the status bar and the reserved strip is painted with the app background.

#### Scenario: Installed on a phone with a notch
- **WHEN** the user opens the installed app on a device with a status bar or a notch
- **THEN** the header content starts below that area and no part of it is hidden or blurred behind it

#### Scenario: A device without a cutout
- **WHEN** the safe-area inset is zero
- **THEN** the header keeps its usual height without adding an empty strip

#### Scenario: The page scrolls under the header
- **WHEN** the user scrolls the content of a screen
- **THEN** the reserved top strip keeps the app background and the header text stays readable

### Requirement: Scrollbars are hidden on small screens

The system SHALL hide the visible scrollbar of every scrollable region while the viewport is narrower than the tablet breakpoint, SHALL keep those regions scrollable by touch, trackpad and keyboard, and SHALL keep the scrollbar visible on larger viewports.

#### Scenario: Scrolling a wide calendar on a phone
- **WHEN** the year calendar is wider than the screen
- **THEN** the user can scroll it horizontally without seeing a scrollbar

#### Scenario: Scrolling a long list on a phone
- **WHEN** a screen or a dialog holds more content than fits
- **THEN** it scrolls normally and shows no scrollbar

#### Scenario: A desktop window
- **WHEN** the viewport is at or above the tablet breakpoint
- **THEN** scrollable regions keep their visible scrollbar

### Requirement: The page never scrolls sideways

The system SHALL keep the document at the viewport width on small screens, so a wide element — a tablature grid, a calendar, a table — scrolls inside its own container instead of moving the whole page.

#### Scenario: A wide tablature
- **WHEN** the tablature grid is wider than the section that holds it
- **THEN** only that section scrolls and the page keeps its side margins

#### Scenario: Reaching the end of the content
- **WHEN** the user scrolls to the end of any screen
- **THEN** there is no empty horizontal band beyond the page margins

### Requirement: The page never zooms on interaction

The system SHALL declare a viewport without user scaling, SHALL render text inputs, text areas and search fields at 16 px or more at every breakpoint, and SHALL prevent the double-tap zoom on controls, so focusing a control, tapping once or tapping twice never changes the page scale.

#### Scenario: Signing in on a phone
- **WHEN** the user focuses the email or password field after opening the account screen
- **THEN** the page keeps its zoom level and only the keyboard opens

#### Scenario: Searching on a phone
- **WHEN** the user focuses any search field
- **THEN** the page keeps its zoom level

#### Scenario: A wide phone or a small tablet
- **WHEN** the user focuses a text control while the viewport is wider than the phone breakpoint
- **THEN** the control still uses at least 16 px and the page does not zoom

#### Scenario: Tapping twice on a control
- **WHEN** the user taps the same button or link twice in quick succession
- **THEN** the page does not zoom in

#### Scenario: Pinching the screen
- **WHEN** the user pinches the screen in a browser that honours the declared viewport scale
- **THEN** the app does not scale and the content stays at its normal size
