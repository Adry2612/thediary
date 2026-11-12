# licks-library Specification

## Purpose
Gives the user a library for the technical fragments they want to drill — riffs, phrases and exercises — with study material attached as files or links, a fixed musical vocabulary and a per-lick record of speed progress, kept apart from the songs they are learning.

## Requirements

### Requirement: Licks live in a library of their own

The system SHALL keep licks in their own collection, list them on a dedicated Licks page, and SHALL NOT show them in the repertoire list.

#### Scenario: A saved lick appears in the licks library
- **WHEN** the user saves a lick
- **THEN** the licks library lists it with its title, key, techniques and current BPM when known

#### Scenario: A lick does not appear in the repertoire
- **WHEN** the user opens the repertoire list after saving a lick
- **THEN** the lick is not among the repertoire items

#### Scenario: Starting a new lick
- **WHEN** the user activates the action to add a lick
- **THEN** the editor opens with no material, no key, no techniques and no BPM history

### Requirement: A lick carries study material

The system SHALL let the user attach one or more study resources to a lick — Guitar Pro files, PDFs, images, Songsterr, YouTube, Spotify or HTTPS links —, SHALL reuse the shared material editor and library, and SHALL show each resource with the viewer that corresponds to its type.

#### Scenario: Attaching a Guitar Pro file
- **WHEN** the user attaches a `.gp` file to a lick and saves
- **THEN** the lick lists the file and its page renders the tablature with the Guitar Pro viewer

#### Scenario: Reusing saved material
- **WHEN** the user chooses an entry from the material library
- **THEN** the lick stores an independent copy and keeps working if the library entry is edited or deleted

#### Scenario: No material is valid
- **WHEN** the user saves a lick with a title but no material
- **THEN** the lick is saved and its page shows the empty-material message

#### Scenario: Library card preview
- **WHEN** the licks library lists a lick with material
- **THEN** its card shows a clipped preview of the selected resource, with tabs to switch between multiple resources

#### Scenario: Library card without material
- **WHEN** a lick has no material
- **THEN** its card shows the empty-material placeholder

#### Scenario: A retired resource
- **WHEN** stored data contains a text TAB or an unknown resource kind
- **THEN** the app drops that resource and keeps the lick and its valid material

### Requirement: A lick carries a key from the fixed catalogue

The system SHALL let the user classify a lick with one musical key from a fixed catalogue of the twelve chromatic roots in major and minor, SHALL keep the key optional so a quick idea can be saved without one, SHALL show a lick without a key as unclassified, and SHALL discard a stored key that is not in the catalogue without discarding the lick.

#### Scenario: Choosing a key
- **WHEN** the user picks a key while editing a lick
- **THEN** the app stores it and shows it with the lick

#### Scenario: A key is optional
- **WHEN** the user saves a lick without choosing a key
- **THEN** the lick is saved and shown as unclassified

#### Scenario: An unknown stored key
- **WHEN** a stored lick has a key the catalogue does not contain
- **THEN** the app loads the lick without a key and keeps the rest of its content

### Requirement: A lick's key can be detected from a Guitar Pro tab

The system SHALL detect a lick's key from its Guitar Pro material, SHALL fill it automatically when the key is empty, SHALL offer an explicit detection action for previously added tabs, SHALL mark the result as automatic with a warning that it may be incorrect, and SHALL treat a manually chosen key as manual.

#### Scenario: Adding a Guitar Pro tab to a lick without a key
- **WHEN** the user attaches a Guitar Pro file to a lick that has no key
- **THEN** the editor detects the key, fills the field and marks it as automatic

#### Scenario: Detecting the key of an existing tab
- **WHEN** the user presses the detection action on a lick that already has a Guitar Pro file
- **THEN** the editor analyzes the file and replaces the key with the detected one, marked as automatic

#### Scenario: Automatic key warning
- **WHEN** a key comes from automatic detection
- **THEN** the editor, the lick page and the cards mark it as automatic and state that it may not be correct

#### Scenario: Manual override
- **WHEN** the user chooses a key by hand after an automatic detection
- **THEN** the key is marked as manual and the automatic warning disappears

#### Scenario: Not enough notes
- **WHEN** the Guitar Pro file has fewer than three pitched notes or fewer than three pitch classes
- **THEN** no key is detected and the editor tells the user to choose one manually

#### Scenario: No Guitar Pro material
- **WHEN** a lick has no Guitar Pro file
- **THEN** the detection action is unavailable and the editor explains that a Guitar Pro file is needed

### Requirement: Techniques come from a closed global catalogue

The system SHALL let the user classify a lick with any combination of techniques from a single global catalogue shared with practice technique blocks — alternate picking, sweep picking, legato, bending, tapping, hybrid picking, economy picking, fingerstyle, strumming, slide, palm mute, harmonics, string skipping, tremolo picking, double stops, arpeggios, slap, pop, chicken picking and whammy bar —, SHALL keep a Spanish and an original name for each technique, SHALL NOT accept a technique chosen as free text, SHALL keep the classification optional, and SHALL discard stored techniques outside the catalogue without discarding the lick.

#### Scenario: Choosing several techniques
- **WHEN** the user selects two or more techniques for a lick
- **THEN** the app stores all of them and shows each one with its name according to the technique-name preference

#### Scenario: The catalogue is the only source
- **WHEN** the user classifies a lick
- **THEN** the app offers only the catalogue techniques and no field for a custom label

#### Scenario: Stored labels outside the catalogue
- **WHEN** a stored lick carries a technique the catalogue does not contain
- **THEN** the app drops that technique and keeps the valid ones and the lick

#### Scenario: Technique names are translated
- **WHEN** the user views the licks library with the technique-name preference set to Spanish or to the original name
- **THEN** every technique is named in the chosen form, regardless of the interface language

#### Scenario: The original name is available in Spanish
- **WHEN** the interface is in Spanish and the user chooses original technique names
- **THEN** badges, pickers and analytics show the original names instead of the Spanish ones

#### Scenario: A translated name stays in Spanish
- **WHEN** the interface is in Spanish, the user chooses original technique names and the technique's original name is only a translation, such as strumming
- **THEN** it is shown as “Rasgueo”, while proper names such as “Sweep picking” keep their original form

#### Scenario: The preference applies to every lick surface
- **WHEN** the user changes the technique-name preference
- **THEN** lick cards, the lick detail, the editor and the technique distribution use the new form

### Requirement: A lick can be linked to one song

The system SHALL let the user link a lick to at most one song from the repertoire, SHALL keep the link optional, SHALL offer only songs and never other licks, and SHALL keep the lick when the linked song is deleted, removing only the link.

#### Scenario: Linking a lick to a song
- **WHEN** the user chooses a song for a lick
- **THEN** the app shows the song with the lick and keeps the link when the lick is edited

#### Scenario: Only songs can be linked
- **WHEN** the user opens the song selector while editing a lick
- **THEN** the app lists the repertoire songs and no licks

#### Scenario: The linked song disappears
- **WHEN** the user deletes the song linked to a lick
- **THEN** the lick keeps loading without a link

### Requirement: Speed progress is recorded per lick

The system SHALL keep, for each lick, an optional target BPM, a current BPM and a dated history of BPM entries with an optional note, SHALL accept BPM values from 40 to 240, and SHALL, when the user records a BPM, append an entry, set it as the current BPM, update the last-practised date and increase the practice count.

#### Scenario: Recording a new BPM
- **WHEN** the user records a BPM for a lick
- **THEN** the app adds an entry dated today with that BPM and the optional note, and shows it as the current BPM

#### Scenario: The history keeps its order
- **WHEN** the user records several BPM entries over time
- **THEN** the app keeps every entry with its date and shows them from oldest to newest

#### Scenario: A target is optional
- **WHEN** the user saves a lick without a target BPM
- **THEN** the lick tracks its current BPM and history without a target

#### Scenario: An out-of-range BPM
- **WHEN** the user enters a BPM lower than 40 or higher than 240
- **THEN** the app rejects it and does not add an entry

#### Scenario: One lick does not affect another
- **WHEN** the user records a BPM for one lick
- **THEN** the target, current BPM, history and practice dates of every other lick stay unchanged

### Requirement: A lick can be marked as practised without a BPM entry

The system SHALL let the user mark a lick as practised today without recording a BPM, updating its last-practised date and increasing its practice count while leaving its current BPM and BPM history unchanged.

#### Scenario: Marking a lick as practised
- **WHEN** the user marks a lick as practised today
- **THEN** its last-practised date becomes today and its practice count increases

#### Scenario: The BPM history is untouched
- **WHEN** the user marks a lick as practised without entering a BPM
- **THEN** no BPM entry is added and the current BPM stays the same

### Requirement: Deleting a lick removes its history

The system SHALL let the user delete a lick after confirming the action, and SHALL remove the lick with its BPM history from the library and from every metric.

#### Scenario: Confirming the deletion
- **WHEN** the user confirms the deletion of a lick
- **THEN** the lick no longer appears in the library, the metrics or the forgotten-lick selection

#### Scenario: Cancelling the deletion
- **WHEN** the user dismisses the confirmation without confirming
- **THEN** the lick and its history stay as they were

### Requirement: Licks persist and sync with the user's data

The system SHALL persist licks with the rest of the user's practice data in the browser and in the cloud, SHALL merge them by identity when local and remote data meet, and SHALL load data saved before this library existed without failing.

#### Scenario: Licks survive a reload
- **WHEN** the user reloads the app after saving licks
- **THEN** the licks, their BPM history and their links are still there

#### Scenario: Licks from another device arrive
- **WHEN** the user's cloud data contains licks this browser does not have
- **THEN** the app merges them into the library without duplicating the ones already present

#### Scenario: Data saved before the library existed
- **WHEN** the app loads practice data that has no licks collection
- **THEN** the app starts with an empty licks library and keeps the rest of the data intact

### Requirement: Repertoire licks migrate once into the new library

The system SHALL, when it loads practice data that still contains licks in the repertoire, convert each one into a lick with the same title and its valid study material, discard any tablature fields stored by the retired tab editor, leave its key, techniques and BPM history empty, remove it from the repertoire, and SHALL perform the migration only once even if the app is reloaded or the migration is interrupted.

#### Scenario: An existing repertoire lick is migrated
- **WHEN** the app loads data with a repertoire item of kind lick
- **THEN** the licks library contains a lick with that title and its valid material, and the repertoire no longer lists the item

#### Scenario: Missing classification is not invented
- **WHEN** a migrated lick has no key, techniques or BPM history
- **THEN** the app leaves those values empty and shows the lick as unclassified

#### Scenario: Running the migration again changes nothing
- **WHEN** the app loads data after the migration has run
- **THEN** no duplicate licks are created and no licks return to the repertoire

#### Scenario: A lick without material
- **WHEN** a repertoire lick has no stored material
- **THEN** the app migrates it without material and keeps its title

### Requirement: A lick is edited on its own screen

The system SHALL open the lick editor as a full page at `/licks/new` when creating a lick and at `/licks/[id]/edit` when editing one, SHALL NOT open it inside a dialog, and SHALL return to the lick after saving.

#### Scenario: Editing an existing lick
- **WHEN** the user chooses to edit a lick
- **THEN** the app navigates to that lick's edit page and the material panel uses the full width of the content column

#### Scenario: Creating a lick
- **WHEN** the user chooses to create a lick
- **THEN** the app navigates to `/licks/new` and saves the new lick before returning to it

#### Scenario: Leaving without saving
- **WHEN** the user cancels the editor
- **THEN** the app returns to the lick or to the licks list without saving

### Requirement: A draft can be saved without finishing the lick

The system SHALL offer a **Save draft** action inside the editor that persists the current material and the fields that are already valid, SHALL use the provisional title “Sin título” when the title is empty, SHALL keep the user in the editor after saving, and SHALL update the same lick on the next save. Saving the whole lick SHALL keep validating the title and the target BPM as before.

#### Scenario: Saving an unfinished new lick
- **WHEN** the user attaches material in a new lick, leaves the title empty and presses Save draft
- **THEN** a lick titled “Sin título” is stored and listed in the library, the editor stays open and the material is kept

#### Scenario: Continuing after a draft save
- **WHEN** the user edits the material again and presses Save draft a second time
- **THEN** the same lick is updated, not a second one

#### Scenario: Finishing the lick
- **WHEN** the user writes a title and presses Save lick after a draft save
- **THEN** the same lick is updated with the title and the full form, and the user returns to the lick page

#### Scenario: Invalid optional fields do not block the draft
- **WHEN** the target BPM is empty or out of range and the user presses Save draft
- **THEN** the draft is saved and the invalid BPM is not stored

#### Scenario: Saving an existing lick's material
- **WHEN** the user edits the material of an existing lick and presses Save draft
- **THEN** the material is updated and the editor stays open

#### Scenario: Feedback after saving
- **WHEN** a draft save finishes
- **THEN** the editor announces “Borrador guardado” without moving the focus out of the editor

### Requirement: A lick can carry a YouTube reference clip

The system SHALL let the user attach at most one YouTube video to a lick with a start and an end time, SHALL accept seconds, `m:ss` and `h:mm:ss`, SHALL require the end to be later than the start, SHALL keep the clip optional, and SHALL discard an invalid stored clip without discarding the lick.

#### Scenario: Saving a clip
- **WHEN** the user enters a YouTube link and the times 1:23 and 1:35 and saves the lick
- **THEN** the lick keeps that link with its start and end and shows them when it is reopened

#### Scenario: A clip is optional
- **WHEN** the user saves a lick without a YouTube link
- **THEN** the lick is saved without a reference clip and its page shows no player

#### Scenario: A link that is not a YouTube video
- **WHEN** the user enters a link that is not a YouTube video or leaves the times empty
- **THEN** the app rejects the clip with a message and does not save the lick

#### Scenario: The end is not after the start
- **WHEN** the user enters an end time equal to or earlier than the start
- **THEN** the app rejects the clip with a message and does not save the lick

#### Scenario: Removing the clip
- **WHEN** the user clears the YouTube link of a lick that had one and saves
- **THEN** the lick is saved without a reference clip

#### Scenario: A lick from before this feature
- **WHEN** the app loads a lick saved without a reference clip
- **THEN** the lick loads with all its other content and no clip

#### Scenario: A stored clip that is no longer valid
- **WHEN** a stored lick has a clip whose link is not a YouTube video or whose times do not fit
- **THEN** the app loads the lick without that clip and keeps the rest of its content

### Requirement: The reference clip plays only its fragment in a loop

The system SHALL embed the reference clip on the lick's page, SHALL start playback at the marked start, SHALL return to the start when the marked end is reached and repeat the fragment, and SHALL offer a link that opens YouTube at the start.

#### Scenario: Opening a lick with a clip
- **WHEN** the user opens the page of a lick that has a reference clip
- **THEN** the page shows the video with a line naming its start and end

#### Scenario: Repeating the fragment
- **WHEN** the video reaches the marked end during playback
- **THEN** it goes back to the marked start and keeps playing from there

#### Scenario: Opening the fragment on YouTube
- **WHEN** the user activates the link that opens YouTube
- **THEN** YouTube opens the same video at the marked start

#### Scenario: Changing the clip
- **WHEN** the user edits the link or the times of a lick and saves
- **THEN** the page shows the video with the new fragment and the loop uses it
