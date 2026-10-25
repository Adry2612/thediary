# Spec Delta

## ADDED Requirements

### Requirement: The tablature keeps the app frame on small screens

The system SHALL keep the tab editor and the tab viewer inside the app's horizontal rhythm on small screens: its controls SHALL wrap inside the section padding without clipping, its grid SHALL fit or scroll inside its own container without widening the page, and a dialog hosting the editor SHALL keep the same side margin as a page.

#### Scenario: The tab controls on a phone
- **WHEN** the tab editor renders at a phone width
- **THEN** resolution, measures, fret and clear actions wrap inside the section and none is cut off at the edge

#### Scenario: A long tablature on a phone
- **WHEN** the tab has more columns than fit the section
- **THEN** the grid stays inside the section and the page keeps its margins

#### Scenario: The editor inside the lick dialog
- **WHEN** the user opens the tab editor in the lick dialog on a phone
- **THEN** the dialog keeps the app's side margin and the tab section keeps its own inner padding

#### Scenario: The read-only tablature
- **WHEN** a saved tab is shown outside the editor
- **THEN** it stays within the card that holds it and scrolls horizontally there if needed

## REMOVED Requirements

### Requirement: Repertoire items are created on their own page

**Reason**: The creation form moves into a dialog over the repertoire, so there is no dedicated creation page to navigate to.
**Migration**: The dialog behaviour, its close control and its save flow are specified by the "The repertoire header offers adding an item" requirement in `repertoire-library` and by the way-back scenario in `app-navigation`.
