# Spec Delta

## MODIFIED Requirements

### Requirement: A saved practice records the guitar type used

The system SHALL let the user choose electric or acoustic guitar for a practice session, SHALL offer that choice while the practice runs, in manual practice entry and in the session editor, and SHALL store the chosen type with the session. A quick practice started from a repertoire item SHALL ask for the type before starting, preselected from the item's declared type or from the last used type, and SHALL require the user to confirm electric or acoustic. Other new practices SHALL start from the last used type or stay unset, and the system SHALL never invent one.

#### Scenario: Choosing the guitar while practising
- **WHEN** the user selects electric or acoustic in a running practice
- **THEN** the session uses that type and the saved practice stores it

#### Scenario: Changing the guitar during the session
- **WHEN** the user changes the guitar type before finishing the practice
- **THEN** the saved practice stores the last chosen type for the whole session

#### Scenario: Choosing the guitar while preparing
- **WHEN** the user selects electric or acoustic in the practice plan
- **THEN** the session uses that type and the saved practice stores it

#### Scenario: A quick practice from a repertoire item
- **WHEN** the user starts a quick practice from a repertoire item that declares a guitar type
- **THEN** the confirmation opens with that type selected and the session starts with it once the user confirms

#### Scenario: A quick practice from an item without a type
- **WHEN** the item declares no guitar type and the user has a last used type
- **THEN** the confirmation opens with the last used type selected and the session starts with it once the user confirms

#### Scenario: No known guitar type
- **WHEN** the item declares no guitar type and there is no last used type
- **THEN** the confirmation asks the user to choose electric or acoustic and no session starts until one is chosen

#### Scenario: Cancelling the confirmation
- **WHEN** the user closes the confirmation without starting
- **THEN** no session starts and the repertoire stays as it was

#### Scenario: Manual practice
- **WHEN** the user records a practice manually and chooses a guitar type
- **THEN** the saved practice stores that type

#### Scenario: Editing a saved practice
- **WHEN** the user edits a saved practice and changes its guitar type
- **THEN** the practice stores the new type and the dashboard balance uses it

#### Scenario: Clearing the guitar type
- **WHEN** the user chooses not to specify the guitar type in the session editor
- **THEN** the practice keeps no guitar type and counts as unclassified

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no guitar type
- **THEN** it loads normally and remains unclassified instead of receiving an invented type

#### Scenario: Last used type
- **WHEN** the user starts a new practice that does not declare a guitar type after having chosen one before
- **THEN** the choice starts on the last used type and the user can change it

#### Scenario: Stored type survives reload and sync
- **WHEN** a practice with a guitar type is reloaded or merged from another device
- **THEN** the type is preserved, and an invalid stored value is discarded without losing the practice

### Requirement: The timer can continue past a block's planned time

The system SHALL offer an option to keep the timer running after a block's planned time until the user advances to the next block, SHALL show a brief block-complete notice that dismisses itself, SHALL keep the next-block action available while the timer waits or runs overtime, SHALL include the overtime in the session total, and SHALL leave the option off by default.

#### Scenario: The option is off
- **WHEN** a block reaches its planned time with the option off
- **THEN** the timer stops at zero and waits for the user to advance, as before

#### Scenario: The option is on
- **WHEN** a non-final block reaches its planned time with the option on
- **THEN** the timer keeps running in that block and the total keeps increasing

#### Scenario: The notice stays visible
- **WHEN** a block reaches its planned time and the timer is waiting or running overtime
- **THEN** a brief notice appears and dismisses itself, while the next-block action stays visible until the user advances

#### Scenario: The block-complete signal sounds once
- **WHEN** a block reaches its planned time and the timer keeps running overtime
- **THEN** the block-complete sound plays once and does not play again on later timer updates

#### Scenario: Resuming overtime does not repeat the signal
- **WHEN** the user pauses during overtime and resumes the same block
- **THEN** the block-complete sound does not play again

#### Scenario: Advancing after overtime
- **WHEN** the user advances to the next block during overtime
- **THEN** the next block starts with its own full planned time

#### Scenario: Pausing during overtime
- **WHEN** the user pauses while a block runs overtime
- **THEN** the timer pauses without advancing the block

#### Scenario: The final block
- **WHEN** the final block reaches its planned time
- **THEN** the practice completes as before instead of entering overtime

#### Scenario: The total includes overtime
- **WHEN** a practice with overtime is saved
- **THEN** its recorded duration and block time include the overtime

## ADDED Requirements

### Requirement: A free practice is complete when the user ends it

The system SHALL store a practice that has no planned duration as complete when the user finishes it, SHALL present it as a completed practice in the day detail, and SHALL NOT describe it as finished before completing a routine. A planned practice ended before its last block SHALL keep reporting that it was finished early.

#### Scenario: A free practice from the practice screen
- **WHEN** the user starts a quick practice, stops the timer with the finish control and saves it
- **THEN** the practice is stored as complete and the day detail does not say it was finished before completing the routine

#### Scenario: A free practice from the repertoire
- **WHEN** the user starts a quick practice from a repertoire item and ends it with the finish control
- **THEN** the practice is stored as complete and shown as such

#### Scenario: A planned routine ended early
- **WHEN** the user finishes a planned routine before its last block ends
- **THEN** the practice keeps reporting that it was finished before completing the routine

#### Scenario: A planned routine reaches its end
- **WHEN** the timer completes the last block of a planned routine
- **THEN** the practice is stored as complete, as before

#### Scenario: Editing a free practice
- **WHEN** the user edits and saves a free practice that was stored as complete
- **THEN** it stays complete unless the user changes its completion state explicitly

### Requirement: The practice settings offer a session time target

The system SHALL let the user set an optional whole-minute target for the current practice, SHALL offer it in the practice settings of both planned and free sessions, and SHALL also offer it in the confirmation that starts a free practice from the repertoire.

#### Scenario: Setting a target
- **WHEN** the user opens the practice settings and sets a target of 30 minutes
- **THEN** the session keeps that target and the timer continues running

#### Scenario: Free practice settings
- **WHEN** the user opens the practice settings during a free practice
- **THEN** the time target is available even though the session has no planned blocks

#### Scenario: Setting the target before starting
- **WHEN** the user sets a target in the confirmation of a free repertoire practice and starts it
- **THEN** the session starts with that target

#### Scenario: Clearing the target
- **WHEN** the user removes the target
- **THEN** the session continues without a target and no alert is scheduled

#### Scenario: An invalid target
- **WHEN** the user enters zero, a negative value or a fraction of a minute
- **THEN** the value is not accepted as a target

#### Scenario: The target survives a pause
- **WHEN** the user pauses and resumes the practice
- **THEN** the target is kept for the same session

#### Scenario: A target already reached
- **WHEN** the user sets a target shorter than the time already practised
- **THEN** the timer pauses and the target notice appears without waiting for more time

### Requirement: The time target pauses the practice when reached

The system SHALL play the end sound once, pause the timer and show a brief notice that dismisses itself when the elapsed time reaches the target, SHALL let the user resume past the target or finish the practice, and SHALL NOT alert again for the same target after the user resumes.

#### Scenario: Reaching the target
- **WHEN** the elapsed time reaches the session target
- **THEN** the end sound plays once, the timer pauses and a brief notice states that the target was reached

#### Scenario: The target notice dismisses itself
- **WHEN** the target notice has been visible for a few seconds
- **THEN** it disappears without blocking the timer, the resume action or the finish action

#### Scenario: The timer updates past the target
- **WHEN** a timer update crosses the target before the pause takes effect
- **THEN** the timer stops at the target instead of continuing to count

#### Scenario: Continuing after the target
- **WHEN** the user resumes the practice after the notice
- **THEN** the timer continues counting, the notice disappears and the sound does not play again for that target

#### Scenario: Finishing after the target
- **WHEN** the user finishes the practice from the target notice
- **THEN** the completion flow opens with the time practised so far

#### Scenario: No target
- **WHEN** the session has no target
- **THEN** the timer behaves as before and no target notice appears

#### Scenario: Changing the target after reaching it
- **WHEN** the user sets a new target after the previous one was reached
- **THEN** the session uses the new target and the alert for it can fire once

### Requirement: The end-of-practice summary is neutral

The completion dialog SHALL present itself as a session summary and SHALL NOT announce the practice as finished before the user saves it.

#### Scenario: Opening the summary
- **WHEN** the timer ends or the user finishes the session
- **THEN** the dialog shows a neutral session-summary heading and a review-and-save action instead of a finished-practice message

#### Scenario: Saving the practice
- **WHEN** the user saves from the summary
- **THEN** the practice is stored exactly as before

### Requirement: The wellbeing response scale uses no emojis

The system SHALL let the user record mood and focus with a one-to-five scale that shows the number and a textual label for each value, SHALL keep both metrics optional and clearable, and SHALL NOT use emoji characters in the control.

#### Scenario: Choosing a value
- **WHEN** the user picks a value for mood or focus
- **THEN** the control shows that value and its textual label and the session stores the number

#### Scenario: Different labels per metric
- **WHEN** the user opens the mood and the focus controls
- **THEN** each shows labels that describe its own metric, such as "Bajo" or "Enfocado", instead of a shared face

#### Scenario: Clearing a value
- **WHEN** the user chooses not to answer a metric
- **THEN** the control shows no value and the session stores none

#### Scenario: Reading the control with a screen reader
- **WHEN** the user reaches the scale with a screen reader
- **THEN** each option announces its metric, its number and its label

#### Scenario: No emoji
- **WHEN** the mood and focus controls are shown
- **THEN** no emoji character appears in them
