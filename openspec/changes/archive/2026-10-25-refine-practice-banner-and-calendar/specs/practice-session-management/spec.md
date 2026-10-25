# Spec Delta

## ADDED Requirements

### Requirement: A running practice stays reachable from a floating bar

While a practice is active, the system SHALL show a floating bar that names the practice and offers resume/pause and stop, SHALL treat the whole bar as the way back to the practice, and SHALL keep the text fully legible on hover. Inside the practice screen the bar SHALL appear only while the timer is out of view, and SHALL take the user back to the timer when activated.

#### Scenario: Reading the bar
- **WHEN** the pointer is over the floating bar
- **THEN** its text keeps its normal opacity and only the border or contrast changes

#### Scenario: Pausing and resuming from anywhere
- **WHEN** the practice is running and the user activates the pause control
- **THEN** the timer pauses and the same control turns into resume, without leaving the current screen

#### Scenario: Returning with the bar
- **WHEN** the user activates the bar outside the practice screen
- **THEN** the system opens the practice

#### Scenario: Scrolled past the timer
- **WHEN** the user is on the practice screen and scrolls the timer card out of view
- **THEN** the bar appears with the same name, clock and controls, and disappears when the timer is visible again

#### Scenario: Returning to the timer
- **WHEN** the user activates the bar while already on the practice screen
- **THEN** the system scrolls the timer card back into view instead of navigating

### Requirement: The floating bar can finish the practice

The system SHALL make the floating bar's stop control finish the practice through the existing confirmation and completion flow, SHALL reflect a completed or non-resumable timer by disabling the controls that cannot act, and SHALL bring the user to the practice screen so the completion dialog is visible.

#### Scenario: Stopping from another screen
- **WHEN** the user activates stop outside the practice screen and confirms
- **THEN** the practice is finished, the user lands on the practice screen and the completion dialog is shown

#### Scenario: Cancelling the stop
- **WHEN** the user opens the stop confirmation and cancels it
- **THEN** the practice keeps its state and the bar stays where it was

#### Scenario: Nothing left to resume
- **WHEN** the current block has ended and the timer is waiting for the next one
- **THEN** the resume control is disabled instead of starting a block that cannot run

#### Scenario: Practice already finished
- **WHEN** the practice has been completed and is waiting to be saved
- **THEN** the bar's timer controls are disabled and the completion flow stays available
