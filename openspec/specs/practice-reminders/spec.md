# practice-reminders Specification

## Purpose
Delivers optional daily reminders about the pending practice, the guitars whose strings are due and long stretches without practising, as system notifications that reach the device with the app closed.

## Requirements

### Requirement: Reminders are optional and off by default

The system SHALL keep all reminders disabled until the user turns them on, SHALL request the browser's notification permission only as part of that action, and SHALL stop scheduling and delivering reminders when the user turns them off or revokes the permission.

#### Scenario: First visit to Settings
- **WHEN** the user opens Settings for the first time
- **THEN** the reminder switch is off and no permission prompt has appeared

#### Scenario: Turning reminders on
- **WHEN** the user turns the reminder switch on
- **THEN** the browser asks for notification permission before any reminder is scheduled

#### Scenario: Permission denied
- **WHEN** the user denies the permission
- **THEN** the switch stays off, no reminder is scheduled and Settings explains that the browser blocked notifications

#### Scenario: Turning reminders off
- **WHEN** the user turns the reminder switch off
- **THEN** the device subscription is removed and no further reminder is delivered

#### Scenario: Permission revoked outside the app
- **WHEN** the user revokes the permission in the browser after enabling reminders
- **THEN** the next check stops delivery and Settings reports that notifications are blocked

### Requirement: Each device controls its own reminders

The system SHALL store the reminder switch, the chosen reminders, the time, the inactivity threshold and the push subscription on the device where they were configured, SHALL NOT copy that configuration or the subscription to another device, and SHALL state in Settings that reminders are configured per device.

#### Scenario: A second device
- **WHEN** the same account opens the app on another device
- **THEN** reminders stay off there until the user enables them on that device

#### Scenario: A guest
- **WHEN** the user has no account
- **THEN** Settings explains that system notifications require signing in and the switch stays off

#### Scenario: Signing out
- **WHEN** the user signs out
- **THEN** the device subscription and its pending reminders are removed and no notification is delivered afterwards

### Requirement: The user chooses which reminders and when

The system SHALL offer independent switches for the practice of the day, the string change and the days without practising, SHALL offer one shared delivery time with 19:00 as the default, and SHALL offer an inactivity threshold of 3, 7, 14 or 30 days with 7 as the default.

#### Scenario: Defaults
- **WHEN** the user enables reminders and changes nothing else
- **THEN** the three reminders are active, the time is 19:00 and the inactivity threshold is 7 days

#### Scenario: Disabling one reminder
- **WHEN** the user turns off the string reminder
- **THEN** strings no longer appear in the daily reminder while the other two keep working

#### Scenario: Changing the time
- **WHEN** the user selects another time
- **THEN** the next reminder uses that time in the device's time zone

#### Scenario: Changing the inactivity threshold
- **WHEN** the user selects another threshold
- **THEN** the inactivity reminder is recalculated with it without waiting for the next practice

#### Scenario: Invalid stored values
- **WHEN** a stored time or threshold is not valid
- **THEN** the default value is used and the rest of the settings load normally

### Requirement: At most one combined reminder per device and local day

The system SHALL combine every applicable reason into a single notification per device and local calendar day, SHALL deliver it at the chosen time in that device's time zone, and SHALL send nothing when no reason applies.

#### Scenario: Several reasons
- **WHEN** a routine is pending, a guitar is due and the inactivity threshold is reached on the same day
- **THEN** the user receives one notification that mentions all three

#### Scenario: Nothing applies
- **WHEN** there is no routine for today, no guitar is due and the inactivity threshold is not reached
- **THEN** no notification is delivered that day

#### Scenario: A delayed delivery
- **WHEN** the scheduled check runs after the chosen time
- **THEN** the reminder is still delivered during the same local day, once

#### Scenario: A repeated check
- **WHEN** the delivery check runs again after a successful send
- **THEN** the same reminder is not delivered a second time

#### Scenario: A different time zone
- **WHEN** the device changes time zone
- **THEN** the next reminder uses the new local time and does not repeat a reminder already delivered that local day

### Requirement: The practice reminder requires a pending routine today

The system SHALL include the practice reason only when the current local weekday has a routine assigned and no saved practice session exists for that local day, and SHALL remove the reason as soon as a session is saved.

#### Scenario: A routine is scheduled
- **WHEN** today has an assigned routine and the user has not practised yet
- **THEN** the reminder names that routine as pending

#### Scenario: No routine scheduled
- **WHEN** today has no assigned routine
- **THEN** the reminder does not mention practice, even if the user has not practised

#### Scenario: Already practised
- **WHEN** the user finishes a practice session today
- **THEN** that day's reminder no longer includes the practice reason

#### Scenario: A manual practice counts
- **WHEN** the user records a practice manually for today
- **THEN** it counts as practised and the practice reason is removed

### Requirement: The string reminder reports the most urgent due guitar

The system SHALL include the string reason only when at least one guitar has reached its days or hours interval, SHALL name the most urgent one, and SHALL NOT include guitars that are merely due soon, have no interval or have no recorded string change.

#### Scenario: One guitar is due
- **WHEN** a guitar has reached its interval
- **THEN** the reminder names that guitar and asks to change its strings

#### Scenario: Several guitars are due
- **WHEN** more than one guitar has reached its interval
- **THEN** the reminder names only the most urgent one

#### Scenario: Only due soon
- **WHEN** a guitar is due soon but has not reached its interval
- **THEN** the string reason is not included

#### Scenario: No interval or no change recorded
- **WHEN** a guitar has no interval or no string change recorded
- **THEN** it does not produce a string reminder

#### Scenario: The reminder is up to date
- **WHEN** the user records the pending string change
- **THEN** the next reminder no longer includes that guitar

### Requirement: The inactivity reminder waits for the configured days

The system SHALL include the inactivity reason only when the user has at least one saved practice and the configured number of local calendar days has passed since the most recent one, and SHALL remove it as soon as a newer practice is saved.

#### Scenario: Threshold reached
- **WHEN** the last practice was the configured number of days ago or more
- **THEN** the reminder states how many days have passed without practising

#### Scenario: Below the threshold
- **WHEN** the last practice was more recent than the threshold
- **THEN** the inactivity reason is not included

#### Scenario: Never practised
- **WHEN** the user has no saved practice yet
- **THEN** no inactivity reminder is produced

#### Scenario: Practising again
- **WHEN** the user saves a new practice
- **THEN** the inactivity count restarts from that day

### Requirement: Push delivery reaches the device with the app closed

The system SHALL deliver reminders through the browser's push service while the app is closed, SHALL retry a failed delivery within the same local day, SHALL remove subscriptions the push service reports as invalid, and SHALL keep each subscription readable only by its owner.

#### Scenario: The app is closed
- **WHEN** the chosen time arrives and the app is not open
- **THEN** the device receives the system notification

#### Scenario: A transient failure
- **WHEN** the push service rejects a delivery for a temporary reason
- **THEN** the system retries it during the same local day without creating a duplicate

#### Scenario: A stale subscription
- **WHEN** the push service reports that a subscription no longer exists
- **THEN** that subscription and its pending reminders are discarded

#### Scenario: Another account
- **WHEN** a user tries to read or change another account's subscription or pending reminders
- **THEN** the system denies it

### Requirement: Tapping the reminder opens the relevant screen

The system SHALL open the app on the screen that resolves the reminder when the user taps it: the start screen for a pending practice or inactivity and the strings block in Tools for a string change.

#### Scenario: A pending practice
- **WHEN** the user taps a reminder that includes a pending practice
- **THEN** the app opens on the start screen

#### Scenario: A due string change
- **WHEN** the user taps a reminder whose reason is a due string change
- **THEN** the app opens on Tools, scrolled to the strings block

#### Scenario: A reminder with several reasons
- **WHEN** the reminder combines a practice and a string change
- **THEN** tapping it opens the start screen, where the practice is the first pending action

### Requirement: Settings reports the permission and offers a test

The system SHALL show whether notifications are unsupported, not yet allowed, allowed or blocked, SHALL offer a test notification while they are allowed, and SHALL explain what to do when they are blocked.

#### Scenario: Unsupported browser
- **WHEN** the browser cannot receive push notifications
- **THEN** Settings says so and keeps reminders off

#### Scenario: Waiting for permission
- **WHEN** the user has not decided on the permission yet
- **THEN** Settings shows the action to enable notifications

#### Scenario: Allowed
- **WHEN** notifications are allowed
- **THEN** Settings shows that state and offers to send a test notification

#### Scenario: Test notification
- **WHEN** the user taps the test action
- **THEN** the device shows a notification that identifies the app and does not schedule anything else

#### Scenario: Blocked
- **WHEN** the browser has blocked notifications
- **THEN** Settings explains that the permission must be re-enabled in the browser and does not keep asking for it

#### Scenario: Keyboard and screen reader
- **WHEN** the user moves through the reminder settings with a keyboard or a screen reader
- **THEN** every switch, the time and the threshold are reachable and announced with their current value
