# Spec Delta

## MODIFIED Requirements

### Requirement: The timer can continue past a block's planned time

The system SHALL offer an option to keep the timer running after a block's planned time until the user advances to the next block, SHALL show the block's overtime in the large timer in green with a brief toast for the finished block, SHALL keep the next-block action available while the timer waits or runs overtime, SHALL include the overtime in the session total, SHALL show the session total in a dedicated row above the large timer, SHALL show only the overtime in the floating bar while the block runs past zero, and SHALL leave the option off by default.

#### Scenario: The option is off
- **WHEN** a block reaches its planned time with the option off
- **THEN** the timer stops at zero and waits for the user to advance, as before

#### Scenario: The option is on
- **WHEN** a non-final block reaches its planned time with the option on
- **THEN** the timer keeps running in that block and the total keeps increasing

#### Scenario: The toast appears and disappears
- **WHEN** a block reaches its planned time and the timer is waiting or running overtime
- **THEN** a brief toast announces the finished block and dismisses itself, while the next-block action stays visible until the user advances

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

#### Scenario: The total sits above the large timer
- **WHEN** the timer runs a countdown session
- **THEN** the session total is shown in a dedicated row above the large timer and below the block title

#### Scenario: The floating bar counts the overtime
- **WHEN** a block runs overtime with the option on and the timer card is out of view
- **THEN** the floating bar shows a single `+mm:ss` value in green instead of the countdown
- **AND** no white `0:00` is printed next to the overtime

#### Scenario: The floating bar still shows zero when there is no overtime
- **WHEN** a block reaches its planned time without continuing and the timer card is out of view
- **THEN** the floating bar shows `0:00` in the normal colour with no green value

#### Scenario: The overtime display clears on advance
- **WHEN** the user advances to the next block
- **THEN** the green overtime and the toast disappear and the new block starts at its full time
