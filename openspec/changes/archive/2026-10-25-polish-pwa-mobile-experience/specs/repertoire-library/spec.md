# Spec Delta

## MODIFIED Requirements

### Requirement: The repertoire header offers adding an item

The repertoire SHALL show "Añadir nuevo elemento" as its main header action, SHALL open the creation form in a dialog over the repertoire instead of navigating to a separate page, and SHALL NOT show a "Preparar práctica" action or a separate block that repeats the add action with descriptive text.

#### Scenario: Header action
- **WHEN** the user opens the repertoire
- **THEN** the header shows an "Añadir nuevo elemento" action that opens the creation dialog over the library

#### Scenario: Closing without saving
- **WHEN** the user closes the creation dialog without completing the form
- **THEN** the repertoire is unchanged and the library is visible again

#### Scenario: Saving from the dialog
- **WHEN** the user completes the form and saves
- **THEN** the dialog closes, the item joins the library and the app opens its detail

#### Scenario: No practice shortcut in the header
- **WHEN** the user opens the repertoire
- **THEN** no "Preparar práctica" action appears in the repertoire header

#### Scenario: No duplicate add block
- **WHEN** the repertoire page renders
- **THEN** the add action appears only in the header, without a second block above the saved items that repeats it and explains how to fill the form

#### Scenario: Rest of the repertoire stays unchanged
- **WHEN** the header action changes
- **THEN** the summary, rankings, search, filters and saved items keep their content and position
