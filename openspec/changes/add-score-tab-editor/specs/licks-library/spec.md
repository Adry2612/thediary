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
