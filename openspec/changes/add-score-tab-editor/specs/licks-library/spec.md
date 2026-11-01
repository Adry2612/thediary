# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: A lick's tablature is plain text shown in a monospaced style`
- TO: `### Requirement: A lick's tablature is a score, with plain text kept as a fallback`

## MODIFIED Requirements

### Requirement: A lick's tablature is a score, with plain text kept as a fallback

The system SHALL store the tablature of a lick as a score, SHALL show a lick that has no score but has plain-text tablature with that text exactly as typed in a monospaced typeface, and SHALL keep long text lines readable by scrolling horizontally instead of collapsing the spacing.

#### Scenario: A lick with a score
- **WHEN** a lick has a score
- **THEN** the app shows the score and not the plain text

#### Scenario: Alignment is preserved
- **WHEN** a lick has only plain-text tablature that uses spaces to align the strings
- **THEN** the app shows the same characters in the same columns when the lick is reopened

#### Scenario: Empty tablature is valid
- **WHEN** the user saves a lick with a title but no tablature
- **THEN** the lick is saved and the editor shows its empty tablature area

#### Scenario: Long lines do not reflow
- **WHEN** a plain-text tablature line is wider than the available space
- **THEN** the app keeps the line on one row and lets the user scroll it

## ADDED Requirements

### Requirement: A lick is edited on its own screen

The system SHALL open the lick editor as a full page at `/licks/new` when creating a lick and at `/licks/[id]/edit` when editing one, SHALL NOT open it inside a dialog, and SHALL return to the lick after saving.

#### Scenario: Editing an existing lick
- **WHEN** the user chooses to edit a lick
- **THEN** the app navigates to that lick's edit page and the tablature uses the full width of the content column

#### Scenario: Creating a lick
- **WHEN** the user chooses to create a lick
- **THEN** the app navigates to `/licks/new` and saves the new lick before returning to it

#### Scenario: Leaving without saving
- **WHEN** the user cancels the editor
- **THEN** the app returns to the lick or to the licks list without saving
