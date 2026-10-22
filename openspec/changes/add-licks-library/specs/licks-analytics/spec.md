# Spec Delta

## Purpose

Turns the saved licks into feedback the user can act on: how fast each passage is becoming over time, which techniques and keys dominate their practice, and which saved idea is at risk of being forgotten.

## ADDED Requirements

### Requirement: BPM evolution is shown for one lick at a time

The system SHALL let the user choose a lick and SHALL draw its BPM history as a line over time, SHALL draw only the entries of that lick, and SHALL never combine the BPM values of different licks in one chart.

#### Scenario: Choosing a lick
- **WHEN** the user selects a lick in the metrics view
- **THEN** the chart plots that lick's BPM entries from oldest to newest by date

#### Scenario: Switching licks
- **WHEN** the user selects a different lick
- **THEN** the chart replaces the previous line with the entries of the newly selected lick

#### Scenario: A lick without history
- **WHEN** the selected lick has no BPM entries
- **THEN** the chart shows an empty state instead of a line

#### Scenario: A lick with one entry
- **WHEN** the selected lick has a single BPM entry
- **THEN** the chart shows that point and its date without drawing a misleading trend

### Requirement: The BPM chart marks the target and the progress reached

The system SHALL draw the lick's target BPM as a dashed horizontal reference line when a target exists, SHALL show the first recorded BPM and the current BPM, and SHALL show the percentage of the target reached, counting the target as reached at 100% when the current BPM meets or exceeds it.

#### Scenario: A lick with a target
- **WHEN** the selected lick has a target BPM
- **THEN** the chart shows the dashed target line and the percentage reached

#### Scenario: The target is exceeded
- **WHEN** the current BPM is higher than the target
- **THEN** the progress reads 100% and the current BPM is still shown as recorded

#### Scenario: The target is not reached
- **WHEN** the current BPM is below the target
- **THEN** the progress shows the rounded percentage of the target reached

#### Scenario: No target and no history
- **WHEN** the selected lick has no target or no entries
- **THEN** the app omits the target line and the percentage and keeps the rest of the view usable

### Requirement: The distribution shows which techniques and keys the licks use

The system SHALL count the saved licks by technique and by key, SHALL show each group as a share of all saved licks, SHALL group licks without a technique or without a key as unclassified, and SHALL update the distribution when a lick is created, edited or deleted.

#### Scenario: A technique dominates
- **WHEN** most saved licks carry the legato technique
- **THEN** the distribution shows legato as the largest share, with its percentage of all saved licks

#### Scenario: A lick carries several techniques
- **WHEN** a lick carries more than one technique
- **THEN** the lick counts once in each of those techniques, so the shares can add up to more than the number of licks

#### Scenario: Licks without techniques
- **WHEN** some licks carry no technique
- **THEN** the distribution shows them together as unclassified

#### Scenario: Licks without a key
- **WHEN** some licks carry no key
- **THEN** the key distribution shows them as unclassified and keeps them out of the named keys

#### Scenario: The distribution follows edits
- **WHEN** the user changes the techniques or the key of a lick
- **THEN** the next view of the distribution reflects the change

#### Scenario: No licks yet
- **WHEN** the library has no licks
- **THEN** each distribution shows an empty state instead of an empty chart

### Requirement: Charts expose their values in text

The system SHALL give every metric chart an accessible name and SHALL make its values available as text, so the information does not depend on seeing the drawing.

#### Scenario: Reading a chart with a screen reader
- **WHEN** a screen reader reaches a metric chart
- **THEN** the chart is announced with its name and its values are available as text

### Requirement: A forgotten lick is proposed for recovery

The system SHALL propose one saved lick as forgotten: SHALL prefer a lick whose last practice is more than 30 days ago, SHALL otherwise propose the lick with the lowest practice frequency relative to its age, SHALL never propose a lick created today that has not been practised, SHALL break ties deterministically, and SHALL hide the proposal when no lick qualifies.

#### Scenario: A lick neglected for more than 30 days
- **WHEN** a saved lick was last practised more than 30 days ago
- **THEN** the app proposes it as the forgotten lick, showing how many days have passed

#### Scenario: No lick is overdue
- **WHEN** no lick has gone more than 30 days without practice
- **THEN** the app proposes the lick with the fewest practices relative to the days since it was created

#### Scenario: A brand-new lick is not forgotten
- **WHEN** a lick was created today and has never been practised
- **THEN** the app does not propose it as forgotten

#### Scenario: The proposal is stable
- **WHEN** the user reloads the view without changing any lick
- **THEN** the app proposes the same lick again

#### Scenario: Nothing qualifies
- **WHEN** the library is empty or no lick qualifies
- **THEN** the app hides the forgotten-lick proposal

### Requirement: The forgotten lick can be recovered from its card

The system SHALL show the proposed lick's title, its key and techniques when known, and the time since its last practice, SHALL offer opening the lick and SHALL offer marking it as practised today, after which the proposal SHALL update.

#### Scenario: Opening the proposed lick
- **WHEN** the user activates the open action on the forgotten-lick card
- **THEN** the app opens that lick's detail with its tablature and BPM progress

#### Scenario: Marking it as practised
- **WHEN** the user marks the proposed lick as practised today from the card
- **THEN** the app records today as its last practice and the card stops proposing that lick while another candidate exists

#### Scenario: A lick that was never practised
- **WHEN** the proposed lick has never been practised
- **THEN** the card says so instead of showing a number of days
