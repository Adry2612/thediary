# app-layout Specification

## Purpose

Defines the one page shell every app screen is laid out in: the column width, the side margins and the vertical rhythm shared by all of them, the structure of a page header without a subtitle above it, and the name each section uses in its header together with a navigation label that does not repeat the app brand.

## Requirements

### Requirement: Every screen shares the same page shell

The system SHALL lay out every app screen inside one page shell that uses the same content column, the same horizontal gutters and the same vertical rhythm, SHALL keep that shell while the screen loads, SHALL NOT shift the side margins or the header when the user navigates from one screen to another, and SHALL widen the column only once on ultrawide viewports before it stops growing.

#### Scenario: Moving between screens
- **WHEN** the user navigates between the start, the dashboard, the tools section, the practice screen, the repertoire, the licks, the recordings, the settings and the account
- **THEN** the content column and its side margins stay in the same place on every screen

#### Scenario: A screen that is still loading
- **WHEN** a screen shows its loading state before its data is ready
- **THEN** the loading state uses the same shell, so nothing moves when the content arrives

#### Scenario: A narrow viewport
- **WHEN** the app is shown on a phone
- **THEN** every screen keeps the same side gutter and no content touches the edge of the viewport

#### Scenario: A wide viewport
- **WHEN** the app is shown on a wide viewport
- **THEN** every screen keeps the same maximum column width instead of widening per screen

#### Scenario: An ultrawide viewport
- **WHEN** the app is shown on a monitor wider than 1536 px
- **THEN** the column grows to 1536 px, keeps its side gutters and stops growing instead of stretching with the screen

#### Scenario: Narrow content inside the shell
- **WHEN** a screen holds a single form or control set that reads better narrow
- **THEN** that content is capped inside the shared column and the side margins of the screen do not change

### Requirement: A page header is a title and a description

The system SHALL show a page header as a title followed by an optional description, SHALL NOT show an uppercase subtitle or eyebrow above that title, and SHALL NOT show one above the title of a dialog either. Header actions SHALL stay in the header.

#### Scenario: A screen header
- **WHEN** the user opens any screen of the app
- **THEN** its header starts with the title and shows no label above it

#### Scenario: A dialog header
- **WHEN** the user opens a dialog
- **THEN** its title has no eyebrow label above it and keeps its description and close action

#### Scenario: Header with an action
- **WHEN** a screen header offers an action, such as registering a manual practice from the dashboard
- **THEN** the action keeps its place in the header next to the title and description

### Requirement: Each section has its own name

The system SHALL name the start screen "Tu diario", the dashboard "Tu evolución" and the practice screen "Tu práctica", SHALL label them "Inicio" and "Evolución" in the navigation, and SHALL NOT reuse the same title on those three screens. The navigation SHALL NOT repeat the app name.

#### Scenario: Reading each screen
- **WHEN** the user visits the start, the dashboard and the practice screen in turn
- **THEN** each one shows its own title and no two of them are identical

#### Scenario: Reading the navigation
- **WHEN** the user opens the navigation menu on the start screen
- **THEN** the first destination reads "Inicio" and does not repeat the app name shown in the header, while the dashboard reads "Evolución"

#### Scenario: The practice screen keeps its name
- **WHEN** the user opens the practice screen without an active practice
- **THEN** its title is "Tu práctica", both before and after the other two sections are renamed

#### Scenario: Switching the language
- **WHEN** the user switches the app to English
- **THEN** the three screens keep distinct names, the dashboard label still matches its title and the first navigation label still does not repeat the app name

### Requirement: The navigation bar widens on ultrawide screens

The system SHALL keep every screen's content column capped at its current maximum width on ultrawide viewports, SHALL let the header and its navigation use a wider capped column than the content, and SHALL stop that wider column before it reaches the viewport edges.

#### Scenario: An ultrawide viewport
- **WHEN** the app is shown on a monitor wide enough that the content column has stopped growing
- **THEN** the header and its navigation are wider than the content column and stay centred, with visible space left at both viewport edges

#### Scenario: The navigation column stops growing
- **WHEN** the viewport keeps widening after the navigation reaches its own maximum width
- **THEN** the navigation stops growing and does not spread to the viewport edges

#### Scenario: Below the ultrawide breakpoint
- **WHEN** the app is shown at a width where the content column has not reached its cap
- **THEN** the header and the content keep the same side gutters and stay aligned as before

#### Scenario: A phone or tablet
- **WHEN** the app is shown on a phone or tablet
- **THEN** the header keeps its current width and gutters without a new overflow or horizontal scroll

#### Scenario: Moving between screens
- **WHEN** the user navigates between screens on an ultrawide viewport
- **THEN** the navigation keeps the same widened column and does not jump between screens
