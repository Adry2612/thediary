# Spec Delta

## Purpose

Keeps each guitar's string change in one small place: when the strings were last changed, how much the guitar has been played since, when the next change is due, and a single photo that identifies it.

## ADDED Requirements

### Requirement: String maintenance lives in Tools

The system SHALL present the user's guitars in a "Cuerdas" block inside the Tools screen, SHALL list one row per guitar, and SHALL NOT give the guitars a screen or a navigation entry of their own.

#### Scenario: Opening Tools
- **WHEN** the user opens Tools
- **THEN** the string block lists every guitar with its name and its next change

#### Scenario: Navigation
- **WHEN** the user opens the navigation
- **THEN** it offers no equipment section of its own

#### Scenario: No guitars yet
- **WHEN** the user has no guitars
- **THEN** the block invites them to add the first one without leaving the screen

### Requirement: A guitar stores a name and a reminder

The system SHALL let the user add, edit and delete a guitar with a required name and an optional interval in days and in hours of use, and SHALL keep the same guitar when it is edited.

#### Scenario: Adding a guitar
- **WHEN** the user fills the name and saves
- **THEN** the guitar appears as a row in the string block

#### Scenario: Name is required
- **WHEN** the user tries to save a guitar without a name
- **THEN** the form stays open and explains that the name is required

#### Scenario: Editing a guitar
- **WHEN** the user changes a guitar's details and saves
- **THEN** the same row is updated instead of a new guitar being created

#### Scenario: Deleting a guitar
- **WHEN** the user confirms the deletion of a guitar
- **THEN** the guitar and its maintenance entries are removed while the saved practices stay in the history

### Requirement: Each guitar has a single maintenance history

The system SHALL record string changes and free notes as dated entries in one history per guitar, SHALL show them newest first, SHALL use the newest string change as the reference for the reminder, and SHALL let the user delete an entry.

#### Scenario: Recording a string change
- **WHEN** the user records a string change with a date
- **THEN** it becomes the newest string change and resets the reminder

#### Scenario: Recording a note
- **WHEN** the user writes a note with a date
- **THEN** it appears in the same history without changing the reminder

#### Scenario: Order
- **WHEN** a guitar has entries on different dates
- **THEN** the history lists them newest first

#### Scenario: Deleting an entry
- **WHEN** the user deletes the newest string change
- **THEN** the previous string change becomes the reference again

#### Scenario: No entries
- **WHEN** a guitar has no entries
- **THEN** its row offers to record the first string change

### Requirement: The usage comes from the practices that selected the guitar

The system SHALL compute a guitar's use as the sum of the saved practices that recorded that guitar and whose date is on or after its newest string change, and SHALL state when part of the practices since that change recorded no guitar.

#### Scenario: Attributed practices
- **WHEN** two saved practices recorded the same guitar
- **THEN** their durations add up in that guitar's use

#### Scenario: Practices without a guitar
- **WHEN** a saved practice recorded no specific guitar
- **THEN** it does not add time to any guitar

#### Scenario: Usage since the last change
- **WHEN** a guitar has practices before and after its newest string change
- **THEN** only the practices from that date onwards count

#### Scenario: Partial attribution is stated
- **WHEN** some practices since the newest string change recorded no guitar
- **THEN** the row states how many, instead of presenting the total as complete

#### Scenario: A deleted guitar
- **WHEN** a practice references a guitar that no longer exists
- **THEN** the practice stays valid and the string block does not fail

### Requirement: The reminder combines days and hours

The system SHALL mark a guitar as due when either configured interval is reached, as due soon when fewer than seven days or fewer than two hours remain on either interval, and as up to date otherwise, and SHALL NOT report a due state when no string change is recorded.

#### Scenario: Days reached
- **WHEN** the days since the newest change reach the days interval
- **THEN** the guitar is due for a string change

#### Scenario: Hours reached
- **WHEN** the use since the newest change reaches the hours interval
- **THEN** the guitar is due even if the days interval is not reached

#### Scenario: One of two intervals
- **WHEN** the guitar has both intervals and only one is reached
- **THEN** it is due and the row states which limit was reached

#### Scenario: Due soon
- **WHEN** fewer than seven days or fewer than two hours remain
- **THEN** the guitar is due soon instead of up to date

#### Scenario: No interval
- **WHEN** a guitar has neither interval configured
- **THEN** its row states that it has no reminder and does not mark it as due

#### Scenario: No change recorded
- **WHEN** a guitar has an interval but no string change recorded
- **THEN** it is not marked as due and the row asks for the first change

### Requirement: The row states its maintenance state in text

The system SHALL show on each guitar row the days and hours since the newest change, the next change date and its state, and SHALL state the state in words so colour is not the only signal.

#### Scenario: Up to date
- **WHEN** no interval is reached
- **THEN** the row shows the last change, the use since it, the next change date and an up-to-date label

#### Scenario: Due
- **WHEN** an interval is reached
- **THEN** the row shows a due label and the action to record a new string change

#### Scenario: Reading without colour
- **WHEN** the row distinguishes up to date, due soon and due
- **THEN** each state also appears as text

### Requirement: A guitar can show one photo

The system SHALL let the user attach one photo per guitar, SHALL store the file outside the synced practice data, SHALL compress it before saving, and SHALL keep the row layout fixed when the photo is missing, loading or unreadable.

#### Scenario: Adding a photo
- **WHEN** the user chooses a supported image for a guitar
- **THEN** the row shows it as a small square thumbnail

#### Scenario: Compression
- **WHEN** the user chooses a large photo
- **THEN** the stored file is reduced before it is saved

#### Scenario: No photo
- **WHEN** a guitar has no photo
- **THEN** the row shows a placeholder icon in the same fixed box

#### Scenario: Unreadable photo
- **WHEN** a guitar's photo cannot be loaded
- **THEN** the row shows the placeholder without breaking the layout

#### Scenario: Removing a photo
- **WHEN** the user removes a guitar's photo
- **THEN** the file is deleted and the placeholder returns

#### Scenario: An upload failure
- **WHEN** the photo cannot be stored
- **THEN** the guitar is still saved and the error is explained

#### Scenario: Unsupported file
- **WHEN** the user chooses a file that is not a supported image
- **THEN** it is rejected with an explanation

### Requirement: Maintenance data survives reload and sync

The system SHALL store guitars, their entries and their photo references with the rest of the practice data, SHALL merge them by identifier when the account syncs, SHALL convert the earlier equipment arrays into entries, and SHALL discard invalid records without losing the rest.

#### Scenario: Reload
- **WHEN** the user reloads after saving maintenance data
- **THEN** the guitars, their entries and their photos are still there

#### Scenario: Account sync
- **WHEN** a signed-in user's maintenance data is synchronized from another device
- **THEN** the new guitars and entries are merged by their identifiers

#### Scenario: Data from the earlier equipment version
- **WHEN** the stored data still has the old string-change and setup arrays
- **THEN** they load as entries of the same history

#### Scenario: Invalid record
- **WHEN** a stored guitar or entry has an invalid shape
- **THEN** that record is discarded and the rest loads

#### Scenario: Photo on another device
- **WHEN** a signed-in user opens their account on another device
- **THEN** the guitar's photo is loaded from the account files

### Requirement: The string block is accessible

The system SHALL give every form control a label, SHALL let every action be reached with the keyboard, SHALL let dialogs be dismissed with the keyboard without saving, and SHALL not rely on hover for any action.

#### Scenario: Keyboard use
- **WHEN** the user opens a guitar form and moves through it with the keyboard
- **THEN** every control is reachable and the dialog can be dismissed without saving

#### Scenario: Screen reader
- **WHEN** a screen reader reads a guitar row
- **THEN** it announces the guitar name, its state and its next change

#### Scenario: Touch
- **WHEN** the user manages a guitar on a touch screen
- **THEN** every action is available without hovering
