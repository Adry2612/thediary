# Spec Delta

## ADDED Requirements

### Requirement: The practice rhythm card summarizes the selected period

The practice rhythm card SHALL show, for the selected period, the period total, the number of sessions, the average time per session, the best day/week/month and how the total compares with the previous equivalent period.

#### Scenario: Period with practice
- **WHEN** the selected period contains at least one practice session
- **THEN** the card shows the period total, the session count, the average time per session, the name and time of the best day/week/month, and the change against the previous period

#### Scenario: Previous period without practice
- **WHEN** the selected period contains practice but the previous equivalent period does not
- **THEN** the comparison states that there is no previous data instead of showing a percentage

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the total, session count, average, best unit and comparison are recalculated for the newly selected period

#### Scenario: Empty period
- **WHEN** the selected period contains no practice
- **THEN** the card keeps its layout, shows a zero total and no best unit, and keeps the existing empty-chart message

## REMOVED Requirements

### Requirement: The dashboard shows when practice happens
**Reason**: The weekday and time-of-day card split the dashboard's time story and repeated information the user did not need; the rhythm card now carries the period detail.
**Migration**: Use the practice rhythm card and its summary; no practice data is lost or migrated.

### Requirement: The schedule card keeps labels clear of their bars
**Reason**: The schedule card no longer exists.
**Migration**: None; the card and its layout are removed.

### Requirement: The two time cards have the same size
**Reason**: There is only one time card left, so pairing it with the schedule card no longer applies.
**Migration**: None; the rhythm card uses the full row.

### Requirement: The dashboard separates volume from pattern
**Reason**: The pattern view is removed, so there is no second time card to distinguish from the volume view.
**Migration**: The rhythm card keeps the volume view and adds the period summary.
