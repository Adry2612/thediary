# Spec Delta

## REMOVED Requirements

### Requirement: Tab editor
**Reason**: The grid of strings by time positions is replaced by a score of bars and timed beats.
**Migration**: Covered by `tab-score-editor`: "A tab is a score of bars made of timed beats", "Typing a fret writes the note" and "The editor fits small screens and touch". Tabs in the grid format open as scores.

### Requirement: Tab measures wrap into systems
**Reason**: The wrapping rule moves with the new drawing and is no longer tied to grid columns or selected cells.
**Migration**: Covered by `tab-score-editor`: "Bars wrap into systems without horizontal scrolling".

### Requirement: Tab notes store performance techniques
**Reason**: Techniques are attached to notes of a beat instead of to a grid cell, and the catalogue gains the ghost note and the accent.
**Migration**: Covered by `tab-score-editor`: "Notes carry performance techniques".

### Requirement: Legato and slide are transitions from a preceding note
**Reason**: The rule that legato and slide need a preceding note on the same string is kept but expressed on beats, not on grid columns.
**Migration**: Covered by `tab-score-editor`: "Notes carry performance techniques" (scenario "A technique that depends on a previous note").

### Requirement: Bends and vibrato carry their shape
**Reason**: Bend amount, release and pre-bend, and the vibrato width, are part of the technique catalogue of the score.
**Migration**: Covered by `tab-score-editor`: "Notes carry performance techniques" (scenario "A bend amount").

### Requirement: The grid supports selecting a range of cells
**Reason**: Selection is made on notes and beats of a score, not on grid cells.
**Migration**: Covered by `tab-score-editor`: "A note or a beat can be selected and kept in view".

### Requirement: Techniques are applied to the selected cells
**Reason**: Techniques are applied to the selected notes through the palette.
**Migration**: Covered by `tab-score-editor`: "A floating palette offers the actions for the selection" and "Notes carry performance techniques".

### Requirement: Techniques are drawn over time, as in a standard tab
**Reason**: Drawing is delegated to the score renderer, which draws techniques over the beats they span.
**Migration**: Covered by `tab-score-editor`: "The tab is drawn as tablature with its rhythm".

### Requirement: Saved tabs without techniques keep loading
**Reason**: Loading of earlier tabs is now a migration from the grid format to the score.
**Migration**: Covered by `tab-score-editor`: "Tabs in the earlier grid format open as scores".

### Requirement: The tablature keeps the app frame on small screens
**Reason**: The score editor and the read-only tab replace the grid and its horizontal container.
**Migration**: Covered by `tab-score-editor`: "The editor fits small screens and touch" and "Bars wrap into systems without horizontal scrolling".
