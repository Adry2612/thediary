# app-navigation Specification

## Purpose
Tells the user where they are and how to walk back: the app name is always a way home, and a view that sits inside another shows the path it came from.

## Requirements

### Requirement: The app name leads to the start

The system SHALL make the app name in the header a link to the start view, reachable and activatable with the keyboard, and SHALL keep it as the element the guided tour points at.

#### Scenario: Choosing the app name
- **WHEN** the user activates the app name in the header
- **THEN** the app opens the start view

#### Scenario: Reaching it with the keyboard
- **WHEN** the user tabs through the header
- **THEN** the app name is a link they can activate

### Requirement: A nested view shows the way back

The system SHALL give every view that hangs off another one a way back marked with a left arrow, naming the view it returns to, and placed before the rest of the content of that view. A way back that navigates SHALL be a link, and one that returns to the previous state of the same screen MAY be a control.

#### Scenario: The repertoire file
- **WHEN** the user opens a repertoire item
- **THEN** the first thing on the page is the way back to the repertoire

#### Scenario: A new repertoire item
- **WHEN** the user opens the form to add an item to the repertoire
- **THEN** the way back to the repertoire is there

#### Scenario: A practiced day
- **WHEN** the user opens the detail of a practiced day
- **THEN** the way back to the dashboard is there

#### Scenario: The routine designer
- **WHEN** the user is designing a routine on the practice screen
- **THEN** the way back to the routines is there
