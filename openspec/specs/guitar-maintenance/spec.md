# guitar-maintenance Specification

## Purpose
Keeps each guitar's string change in one small place: when the strings were last changed, how much the guitar has been played since, when the next change is due, and a single photo that identifies it.

## Requirements

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

### Requirement: A guitar remembers its string type

The system SHALL let the user set a string type of electric, acoustic or classical on each guitar, SHALL store it with the guitar, and SHALL use it as the starting type when a string change is recorded.

#### Scenario: Setting the type
- **WHEN** the user adds or edits a guitar and picks a string type
- **THEN** the type is saved with the guitar and appears selected the next time the form opens

#### Scenario: A type already known
- **WHEN** the user records a string change on a guitar that has a type
- **THEN** the set list shows only that type of strings, without asking again

#### Scenario: A guitar without a type
- **WHEN** the user records a string change on a guitar that has no type
- **THEN** the form shows the type selector so it can be chosen

#### Scenario: Remembering the first choice
- **WHEN** the user records a string change on a guitar that had no type and saves it
- **THEN** the chosen type is stored on the guitar and the next change no longer shows the selector

#### Scenario: An invalid stored type
- **WHEN** a stored guitar has a type the app does not know
- **THEN** the type is discarded and the guitar is treated as having none

### Requirement: The string-change form only asks for the date and the set

The string-change form SHALL ask for the date and the mounted set, SHALL hide the type selector when the guitar already has a type, and SHALL NOT offer a free-text field.

#### Scenario: A short form
- **WHEN** the user opens the string-change form for a guitar with a known type
- **THEN** the form shows the date, the set picker and the save action only

#### Scenario: No free-text details
- **WHEN** the user opens the string-change form
- **THEN** there is no details field, and the note can still be written later from the history

#### Scenario: Custom set
- **WHEN** the user picks a set that is not in the catalogue
- **THEN** the brand, model and gauges are still asked for, and the type comes from the guitar

### Requirement: A string change records the set that was mounted

The system SHALL let the user record a string change with its date and the set mounted, SHALL offer a catalogue of sets grouped by guitar family —eléctrica, acústica y española— with brand, model and gauges, SHALL accept a set typed by hand, and SHALL allow saving the change without specifying any set.

#### Scenario: Choosing a set from the catalogue
- **WHEN** the user opens a string change and picks a model
- **THEN** the brand, the model and its six gauges are shown before saving

#### Scenario: Filtering by family
- **WHEN** the user switches between eléctrica, acústica and española
- **THEN** the list shows only the sets of that family, each with its gauges

#### Scenario: A set typed by hand
- **WHEN** the user chooses the free option
- **THEN** they can write the brand, the model and the gauges, and that is what is saved

#### Scenario: No set
- **WHEN** the user saves the change without choosing a set
- **THEN** the change is recorded with its date and no set

#### Scenario: The catalogue needs no connection
- **WHEN** the app is offline
- **THEN** the catalogue is still available, because it ships with the app

### Requirement: The mounted set is kept with the change

The system SHALL store a copy of the mounted set with the history entry, SHALL show it in the history and in the change form, and SHALL keep showing it even if the model is later removed from the catalogue.

#### Scenario: Reading the history
- **WHEN** the user opens the history of a guitar
- **THEN** each string change shows the set that was mounted, with its gauges

#### Scenario: A retired model
- **WHEN** a stored set no longer exists in the catalogue
- **THEN** the history still shows its brand, model and gauges

#### Scenario: Older entries
- **WHEN** an entry was saved before this change
- **THEN** it keeps showing its date and notes, without a set

### Requirement: Guitar photos accept what phones produce

The system SHALL accept JPG, PNG, WebP, AVIF, GIF, HEIC and HEIF images for the guitar photo, SHALL reject a file it cannot decode at the moment it is chosen, and SHALL say which formats it accepts.

#### Scenario: A photo from an iPhone
- **WHEN** the user chooses a HEIC photo in a browser that can read it
- **THEN** the photo is accepted, reduced and shown before saving

#### Scenario: A format the browser cannot read
- **WHEN** the user chooses an image whose format the browser cannot decode
- **THEN** the form says so at once and no photo is saved

#### Scenario: An unsupported file
- **WHEN** the user chooses a PDF or another non-image file
- **THEN** the form lists the accepted image formats

#### Scenario: Too large
- **WHEN** the image exceeds the size limit
- **THEN** the form says it is too large and keeps the rest of the form as it was

### Requirement: A string set can show its packaging image

The system SHALL let each catalogue set reference an optional photo, SHALL show it as a thumbnail in the set picker, in the string-change history and in the strings row, and SHALL show nothing in its place when the set has no photo or the file cannot be loaded.

#### Scenario: Choosing a set
- **WHEN** the user opens the set picker
- **THEN** each set with a photo shows its thumbnail next to the brand and model, and a set without one shows only its text

#### Scenario: Reading the history
- **WHEN** the user opens the history of a guitar
- **THEN** each string change that has a photo shows its thumbnail

#### Scenario: The strings row
- **WHEN** a guitar has a string change with a photo
- **THEN** the row shows a small thumbnail of that set

#### Scenario: No image
- **WHEN** a set has no photo
- **THEN** no thumbnail and no empty box are shown, and the text does not move to fill a gap

#### Scenario: A decorative image
- **WHEN** a screen reader reaches a set with a photo
- **THEN** the image is not announced twice, because the brand and model already name the set
