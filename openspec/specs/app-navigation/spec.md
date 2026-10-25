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
- **WHEN** the user opens the dialog that adds an item to the repertoire
- **THEN** the dialog offers a close control that returns to the repertoire without saving, and no back arrow to a separate creation page exists

#### Scenario: A practiced day
- **WHEN** the user opens the detail of a practiced day
- **THEN** the way back to the dashboard is there

#### Scenario: The routine designer
- **WHEN** the user is designing a routine on the practice screen
- **THEN** the way back to the routines is there

### Requirement: The mobile header stays pinned and clear of the device status bar

The system SHALL pin the header to the top of the viewport on phone-sized screens and SHALL keep it entirely below the system status bar in the installed app, either because the status bar is opaque or because the device's top safe-area inset is reserved inside the header. It SHALL keep the inset painted with the app background whenever that inset is non-zero, including while the navigation is hidden.

#### Scenario: Installed on a phone with a notch
- **WHEN** the user opens the installed app on a device with a status bar or a notch
- **THEN** the app name and menu start below the status bar and no header content is hidden or blurred behind it

#### Scenario: Edge-to-edge context with a non-zero inset
- **WHEN** the installed app exposes a top inset (for example Android standalone)
- **THEN** the header reserves it and the app name starts below it

#### Scenario: A device without a cutout
- **WHEN** the top inset is zero
- **THEN** the header keeps its usual height without adding an empty strip

#### Scenario: The navigation is hidden
- **WHEN** the header has slid out of view after scrolling down
- **THEN** the reserved inset stays painted with the app background and page content does not appear under the status bar

#### Scenario: A desktop window
- **WHEN** the viewport is at or above the tablet breakpoint
- **THEN** the header keeps its current static placement and the hide behaviour does not run

### Requirement: The header returns on an upward scroll

The system SHALL hide the pinned mobile header after a downward scroll past a small threshold and SHALL show it again on the first upward scroll, keeping it visible at the top of the page and after a route change.

#### Scenario: Scrolling down
- **WHEN** the user scrolls down more than the hide threshold
- **THEN** the header slides out of view and the page keeps its position without a gap

#### Scenario: Scrolling back up
- **WHEN** the header is hidden and the user scrolls up
- **THEN** the header slides back into view

#### Scenario: At the top of the page
- **WHEN** the page is at or near the top
- **THEN** the header stays visible even after a small downward movement

#### Scenario: Changing route
- **WHEN** the user opens another view
- **THEN** the header is visible on the new view

### Requirement: The header does not hide while it is in use

The system SHALL keep the header visible while the mobile menu is open, while the guided tour is active, and SHALL reveal it when a control inside it receives keyboard focus.

#### Scenario: The mobile menu is open
- **WHEN** the user scrolls with the mobile menu open
- **THEN** the header and the menu stay in place

#### Scenario: The guided tour points at the header
- **WHEN** the guided tour is active
- **THEN** the header stays visible so its spotlight keeps pointing at the app name

#### Scenario: Keyboard focus reaches the header
- **WHEN** a header control receives keyboard focus while the header is hidden
- **THEN** the header becomes visible before the control is activated

### Requirement: The header hides and reveals smoothly

The system SHALL animate the mobile header between visible and hidden with a short slide and fade, SHALL skip the animation when the user asks for reduced motion, and SHALL keep the header fully visible and opaque at the tablet breakpoint and above.

#### Scenario: Hiding the header
- **WHEN** the header moves from visible to hidden
- **THEN** it slides up and fades out over a short transition instead of vanishing at once

#### Scenario: Revealing the header
- **WHEN** the header returns
- **THEN** it slides back down, settles and is fully opaque at the end

#### Scenario: Reduced motion
- **WHEN** the user has asked the system to reduce motion
- **THEN** the header changes state without a transition

#### Scenario: A desktop window
- **WHEN** the viewport is at or above the tablet breakpoint
- **THEN** the header is never translated or faded
