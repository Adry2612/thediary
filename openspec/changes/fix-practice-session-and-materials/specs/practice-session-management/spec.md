# Spec Delta

## MODIFIED Requirements

### Requirement: The timer can continue past a block's planned time

The system SHALL offer an option to keep the timer running after a block's planned time until the user advances to the next block, SHALL keep the block-complete notice visible while it runs overtime, SHALL include the overtime in the session total, and SHALL leave the option off by default.

#### Scenario: The option is off
- **WHEN** a block reaches its planned time with the option off
- **THEN** the timer stops at zero and waits for the user to advance, as before

#### Scenario: The option is on
- **WHEN** a non-final block reaches its planned time with the option on
- **THEN** the timer keeps running in that block and the total keeps increasing

#### Scenario: The notice stays visible
- **WHEN** a block is running overtime
- **THEN** the block-complete notice remains visible until the user advances

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

#### Scenario: Opening the practice screen at the top
- **WHEN** the user enters the practice screen while the timer card is visible in the viewport
- **THEN** the bar stays hidden until the timer card actually leaves the viewport

#### Scenario: Switching to split view
- **WHEN** the user toggles split view while on the practice screen and the timer card remains visible
- **THEN** the bar stays hidden after the timer card is placed in its new layout

#### Scenario: Returning to the timer
- **WHEN** the user activates the bar while already on the practice screen
- **THEN** the system scrolls the timer card back into view instead of navigating

## ADDED Requirements

### Requirement: Practice material accepts image files

The system SHALL offer images as attachable study material, SHALL accept JPEG, PNG, WebP, AVIF and GIF files up to 10 MB, SHALL store them through the same local or cloud asset flow as other files, and SHALL preview them inside the material panel with a way to open them in a new tab. Unsupported formats and oversized files SHALL be rejected with a readable error.

#### Scenario: Attaching an image
- **WHEN** the user chooses the image option and selects a supported image file
- **THEN** the image is stored, attached to the current block or repertoire item and shown in the material list

#### Scenario: Previewing an image
- **WHEN** the user selects an attached image
- **THEN** the material panel shows the image without leaving the practice screen

#### Scenario: Opening the image on its own
- **WHEN** the user activates the open action of an attached image
- **THEN** the image opens in a new tab

#### Scenario: Unsupported image
- **WHEN** the user selects an SVG, HEIC/HEIF or another unsupported file for the image option
- **THEN** the app rejects it and explains which formats are accepted

#### Scenario: Oversized image
- **WHEN** the user selects an image larger than 10 MB
- **THEN** the app rejects it before uploading and shows a size error

#### Scenario: Image without an account
- **WHEN** a guest attaches an image
- **THEN** the image is kept in the local library like other guest files

### Requirement: Songsterr links can be attached and open externally

The system SHALL offer Songsterr in the material menu, SHALL accept only HTTPS links on the Songsterr domain, SHALL attach the link to the current block or repertoire item, and SHALL open it in a new tab instead of embedding it.

#### Scenario: Attaching a Songsterr link
- **WHEN** the user chooses the Songsterr option and enters a valid Songsterr URL
- **THEN** the link is attached to the current block or repertoire item

#### Scenario: Opening an attached link
- **WHEN** the user selects a Songsterr material
- **THEN** the panel names the material and offers opening it in a new tab

#### Scenario: Invalid Songsterr link
- **WHEN** the user enters a non-HTTPS URL or a URL outside the Songsterr domain
- **THEN** the app rejects it and keeps the form open with an error
