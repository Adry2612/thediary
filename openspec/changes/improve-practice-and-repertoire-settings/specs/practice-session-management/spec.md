# Spec Delta

## MODIFIED Requirements

### Requirement: Saved practices can be edited

The system SHALL let the user edit a saved practice session, including its title, notes, completion state, duration and its blocks, SHALL present every block's real time and the session duration as `mm:ss` or `h:mm:ss`, SHALL accept the same clock formats when typing, SHALL keep the reported totals consistent with the edited blocks, SHALL report an invalid time next to its field without losing the other edits, and SHALL NOT block a valid save because of a native number-step mismatch.

#### Scenario: User edits the blocks of a saved practice
- **WHEN** the user changes a block's name, category, real time or planned time and saves
- **THEN** the app stores the edited blocks and reports a total duration and a per-category split consistent with them

#### Scenario: User removes every block
- **WHEN** the user removes all the blocks of a saved practice and saves
- **THEN** the app stores the practice without blocks and uses the duration provided directly

#### Scenario: Edited practice keeps its identity
- **WHEN** a saved practice is edited
- **THEN** the app updates that same practice in the history instead of adding a new one

#### Scenario: Editing seconds
- **WHEN** a saved block lasted 1 minute and 23 seconds
- **THEN** the editor shows `1:23` and keeps exactly 83 seconds when the practice is saved

#### Scenario: Typing a clock time
- **WHEN** the user types `1:23` or `83` in a block's real-time field
- **THEN** the block stores 83 seconds

#### Scenario: An invalid time
- **WHEN** the user types letters or a value with seconds above 59 in a real-time field
- **THEN** the field shows an error and the save reports it without a native browser validation error and without losing the other edits

#### Scenario: No decimal step error
- **WHEN** a saved practice has times that are not a multiple of half a minute
- **THEN** the editor opens and saves without a `step` validation error

### Requirement: The timer can continue past a block's planned time

The system SHALL offer an option to keep the timer running after a block's planned time until the user advances to the next block, SHALL show the block's overtime in the large timer in green with an inline notice at the top of the timer card, SHALL keep the next-block action available while the timer waits or runs overtime, SHALL include the overtime in the session total, SHALL show the session total in a dedicated row, and SHALL leave the option off by default.

#### Scenario: The option is off
- **WHEN** a block reaches its planned time with the option off
- **THEN** the timer stops at zero and waits for the user to advance, as before

#### Scenario: The option is on
- **WHEN** a non-final block reaches its planned time with the option on
- **THEN** the timer keeps running in that block and the total keeps increasing

#### Scenario: The notice stays visible
- **WHEN** a block reaches its planned time and the timer is waiting or running overtime
- **THEN** an inline notice appears at the top of the card and dismisses itself, while the next-block action stays visible until the user advances

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

#### Scenario: The large timer counts the overtime
- **WHEN** a non-final block runs overtime with the option on
- **THEN** the large timer shows `+mm:ss` in green instead of staying at zero

#### Scenario: The total keeps its own row
- **WHEN** the timer runs
- **THEN** the session total is shown in a dedicated row without overlapping the large timer or the notice

#### Scenario: The overtime display clears on advance
- **WHEN** the user advances to the next block
- **THEN** the green overtime and the notice disappear and the new block starts at its full time

### Requirement: The practice settings offer a session time target

The system SHALL let the user set an optional whole-minute target for the current practice only in quick practice and quick repertoire sessions, SHALL offer it in the practice settings of those sessions, SHALL offer it in the confirmation that starts a free practice from the repertoire, and SHALL NOT show the target control in a saved routine or in a plan built as a routine.

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

#### Scenario: A saved routine hides the target
- **WHEN** a practice starts from a saved routine
- **THEN** the practice settings show no target control

#### Scenario: A built plan hides the target
- **WHEN** a practice starts from a plan built in the routine editor without saving it as a routine
- **THEN** the practice settings show no target control

#### Scenario: Quick practice keeps the target
- **WHEN** a quick practice of technique starts
- **THEN** the practice settings offer the target control

### Requirement: The time target pauses the practice when reached

The system SHALL play the end sound once, pause the timer and show an inline “Tiempo cumplido” notice at the top of the timer card when the elapsed time reaches the target, SHALL let the user resume past the target or finish the practice, and SHALL NOT alert again for the same target after the user resumes.

#### Scenario: Reaching the target
- **WHEN** the elapsed time reaches the session target
- **THEN** the end sound plays once, the timer pauses and an inline notice at the top of the card states that the target was reached

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

#### Scenario: The notice is inline
- **WHEN** the target is reached
- **THEN** the notice appears inside the timer card at the top instead of in a floating toast

### Requirement: A technique block takes its name from the technique catalogue

The system SHALL let the user choose a technique block's name from the shared technique catalogue through a searchable picker, SHALL show the name according to the technique-name preference, SHALL NOT accept a newly typed technique name, and SHALL keep a previously stored custom name selectable and displayed as stored until the user chooses a catalogue technique.

#### Scenario: Selecting a technique
- **WHEN** the user opens the technique picker and chooses a technique
- **THEN** the block stores that catalogue technique and shows its name according to the preference

#### Scenario: Searching the technique catalogue
- **WHEN** the user types part of a technique name in the picker
- **THEN** the picker lists only the catalogue techniques and custom techniques that match, in either language

#### Scenario: No technique search results
- **WHEN** the search matches no technique
- **THEN** the picker shows an empty result message and the block keeps its current technique or missing state

#### Scenario: A new technique block needs a technique
- **WHEN** a new technique block has no technique chosen
- **THEN** the routine cannot be saved or started until the user picks one

#### Scenario: A previously stored custom name
- **WHEN** a saved technique block has a name outside the catalogue
- **THEN** that name remains selectable in the search picker and is displayed exactly as stored

#### Scenario: No free-text technique
- **WHEN** the block category is technique
- **THEN** the editor offers a button that opens the searchable technique picker instead of a free-text name field or a long select

#### Scenario: The name follows the preference
- **WHEN** the user changes the technique-name preference
- **THEN** catalogue technique blocks change their displayed name and custom names stay as stored

## ADDED Requirements

### Requirement: A theory block takes its name from the theory catalogue

The system SHALL let the user choose a theory block's name from the shared theory catalogue through a searchable picker, SHALL show it according to the technique-name preference, SHALL NOT accept a newly typed theory name, and SHALL keep a previously stored custom name selectable and displayed as stored until the user chooses a catalogue topic.

#### Scenario: Selecting a theory topic
- **WHEN** the user opens the theory picker and chooses a topic
- **THEN** the block stores that catalogue topic and shows its name according to the preference

#### Scenario: Searching the theory catalogue
- **WHEN** the user types part of a theory topic in the picker
- **THEN** the picker lists only the catalogue topics and custom topics that match, in either language

#### Scenario: No theory search results
- **WHEN** the search matches no theory topic
- **THEN** the picker shows an empty result message and the block keeps its current topic or missing state

#### Scenario: A new theory block needs a topic
- **WHEN** a new theory block has no topic chosen
- **THEN** the routine cannot be saved or started until the user picks one

#### Scenario: A previously stored custom theory name
- **WHEN** a saved theory block has a name outside the catalogue
- **THEN** that name remains selectable in the search picker and is displayed exactly as stored

#### Scenario: No free-text theory
- **WHEN** the block category is theory
- **THEN** the editor offers a button that opens the searchable theory picker instead of a free-text name field

#### Scenario: The theory name follows the preference
- **WHEN** the user changes the technique-name preference
- **THEN** catalogue theory blocks change their displayed name and custom names stay as stored
