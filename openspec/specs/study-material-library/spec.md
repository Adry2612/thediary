# study-material-library Specification

## Purpose
Stores each study resource once — a link, a tab, a document or an image — with a title and notes, so the user can find it, edit it and attach it to any practice or repertoire item without typing or uploading it again.

## Requirements

### Requirement: The library stores a study material once

The system SHALL let the user save a study material with a title, a kind, its source and optional notes, where the kind is a tab, a PDF, an image, a Songsterr, YouTube or Spotify link, or a generic link, and SHALL keep a material valid without notes.

#### Scenario: Saving a link
- **WHEN** the user saves a YouTube, Spotify, Songsterr or generic link with a title
- **THEN** the library lists it with its kind and title

#### Scenario: Saving a pasted tab
- **WHEN** the user saves a tab as text
- **THEN** the library keeps the text and can attach it later

#### Scenario: Saving a file
- **WHEN** the user uploads a PDF or an image
- **THEN** the library keeps the file with its title and kind

#### Scenario: A title is required
- **WHEN** the user tries to save a material with a blank title
- **THEN** the app refuses the save and explains that the title is required

#### Scenario: Editing a material
- **WHEN** the user changes a material's title, notes or source
- **THEN** the library shows the updated values

#### Scenario: Deleting a material
- **WHEN** the user deletes a material and confirms
- **THEN** it disappears from the library

### Requirement: The library can be searched and filtered

The system SHALL list the saved materials from most recently updated to oldest, SHALL search them by title and notes, SHALL filter them by kind, SHALL show an empty state when nothing matches, and SHALL keep the list usable without a network connection.

#### Scenario: Searching by title
- **WHEN** the user types part of a title
- **THEN** only the materials whose title or notes contain that text remain

#### Scenario: Filtering by kind
- **WHEN** the user chooses the PDF kind
- **THEN** only the PDF materials are listed

#### Scenario: Search and filter together
- **WHEN** the search text and the kind filter match nothing
- **THEN** the screen says there are no materials for that combination

#### Scenario: An empty library
- **WHEN** the user has saved no materials
- **THEN** the screen explains how to add the first one

#### Scenario: Offline
- **WHEN** the device has no connection
- **THEN** the saved materials still list, search and open

### Requirement: A saved material can be attached to a practice or repertoire item

The system SHALL offer the saved materials in the material picker of the practice panel and of a repertoire item, SHALL attach the chosen material to the current block or item, SHALL show it immediately in that block's material list, and SHALL keep the existing rule that a block shows only its own material.

#### Scenario: Attaching during practice
- **WHEN** the user picks a saved material from the current block's picker
- **THEN** the material appears in that block's material list and opens in the panel

#### Scenario: Attaching while planning a routine
- **WHEN** the user picks a saved material in the routine editor
- **THEN** the material is added to the block being edited

#### Scenario: Attaching to a repertoire item
- **WHEN** the user picks a saved material in a repertoire item
- **THEN** the material is added to that item

#### Scenario: Several materials
- **WHEN** the user attaches the same saved material to two different blocks
- **THEN** each block lists its own attachment

#### Scenario: A block without library material
- **WHEN** the current block has no material of its own or from its song
- **THEN** the panel keeps its empty state instead of showing another block's material

### Requirement: Attaching copies the material instead of linking it

The system SHALL copy the chosen material's source into the attachment, SHALL NOT change an existing attachment when the library entry is renamed, edited, re-kinded or deleted, SHALL keep an attached file available after its library entry is deleted, and SHALL let the user remove an attachment without deleting the library entry.

#### Scenario: Renaming the library entry
- **WHEN** the user renames a material that was already attached to a block
- **THEN** the existing attachment keeps the title and source it was saved with

#### Scenario: Deleting the library entry
- **WHEN** the user deletes a material that is attached to a saved practice
- **THEN** the practice keeps its attachment and can still open it

#### Scenario: Deleting an attachment
- **WHEN** the user removes a material from a block
- **THEN** the library entry remains available for other blocks

#### Scenario: An attached file after deletion
- **WHEN** the user opens a practice whose attached file came from a deleted library entry
- **THEN** the file still opens from the existing asset storage

### Requirement: The library persists and follows the account

The system SHALL store the library with the practice data under the active local namespace, SHALL include it in the cloud practice-data row, SHALL merge it by identifier when local and remote data meet, SHALL keep it after a reload, and SHALL keep it usable offline.

#### Scenario: Reloading
- **WHEN** the user reopens the app after saving materials
- **THEN** the same materials, titles and sources are listed

#### Scenario: A second device
- **WHEN** the same account opens the app on another device with sync available
- **THEN** the library contains the materials saved on the first device

#### Scenario: Merging after an offline session
- **WHEN** local and remote libraries contain different materials
- **THEN** the merged library keeps both, one per identifier

#### Scenario: Creating offline
- **WHEN** the user saves a material with no connection
- **THEN** it is stored locally and joins the cloud data on the next sync

#### Scenario: A guest session
- **WHEN** the user has no account
- **THEN** the library works against the guest local namespace

### Requirement: Uploaded library files reuse the asset flow

The system SHALL store uploaded library files through the same local and cloud asset flow as practice material, SHALL apply the same format and size validation, and SHALL NOT delete an asset that an attachment still references.

#### Scenario: Uploading a PDF
- **WHEN** the user adds a PDF to the library
- **THEN** the file is stored locally and, with an account, also in the cloud

#### Scenario: An unsupported or oversized file
- **WHEN** the user picks a file the existing material rules reject
- **THEN** the library shows the same readable error and saves nothing

#### Scenario: A failed cloud upload
- **WHEN** the cloud copy cannot be uploaded
- **THEN** the local copy is kept and the error is reported without losing the entry

#### Scenario: Deleting the entry does not delete the asset
- **WHEN** the user deletes a library entry whose file is attached to a practice
- **THEN** the stored file is not deleted and the attachment keeps working

### Requirement: The library is reachable from Tools and from the material pickers

The system SHALL offer a "Material de estudio" screen from Tools and from the material picker used by practices and repertoire items, SHALL let the user create, edit, delete and search there, and SHALL ask for confirmation before deleting a material.

#### Scenario: Opening from Tools
- **WHEN** the user activates the study material entry in Herramientas
- **THEN** the library screen opens

#### Scenario: Opening from a picker
- **WHEN** the user opens the saved materials from a practice or repertoire picker
- **THEN** the library picker opens with its search and kind filter

#### Scenario: Deleting with confirmation
- **WHEN** the user deletes a material
- **THEN** the app asks for confirmation and cancelling keeps the material

#### Scenario: Returning to the practice
- **WHEN** the user closes the library picker without choosing
- **THEN** the practice or editor stays as it was
