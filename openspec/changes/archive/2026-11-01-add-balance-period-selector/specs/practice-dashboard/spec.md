# Spec Delta

## ADDED Requirements

### Requirement: The two balance cards share one period selector

The system SHALL show a period selector with the options week, 30 days and year on the skill balance card and on the guitar balance card, SHALL use the same selected period in both cards, SHALL default to 30 days, and SHALL recompute both balances when the period changes from either card.

#### Scenario: Default period
- **WHEN** the dashboard opens
- **THEN** both balance cards show the 30-day period selected

#### Scenario: Changing the period from one card
- **WHEN** the user selects year on the skill balance card
- **THEN** the skill balance and the guitar balance both switch to the year window and the guitar card shows year as selected

#### Scenario: Changing the period from the other card
- **WHEN** the user selects week on the guitar balance card
- **THEN** both balances switch to the week window

#### Scenario: Accessible name and state
- **WHEN** assistive technology reaches the selector
- **THEN** it finds a named group whose buttons expose which period is selected

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown on a phone
- **THEN** the selector wraps inside its card without horizontal overflow and every option stays reachable

#### Scenario: Empty period
- **WHEN** the selected period has no classified practice
- **THEN** both cards keep their layout and show their empty state for that period

#### Scenario: Stable layout
- **WHEN** the user changes the period from either card
- **THEN** both cards keep their height and the content below them does not move

### Requirement: The rhythm chart uses the same period buttons

The system SHALL replace the period dropdown of the practice rhythm chart with the same week, 30 days and year buttons used by the balances, SHALL keep the chart, its summary and its comparison in the selected period, and SHALL default to the week.

#### Scenario: Default period
- **WHEN** the dashboard opens
- **THEN** the rhythm chart shows the week period selected

#### Scenario: Changing the period
- **WHEN** the user selects 30 days on the rhythm chart
- **THEN** the chart, its total, its session count, its best unit and its comparison switch to the 30-day window

#### Scenario: Accessible name and state
- **WHEN** assistive technology reaches the rhythm chart selector
- **THEN** it finds a named group whose buttons expose which period is selected

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown on a phone
- **THEN** the three buttons wrap inside the card without horizontal overflow

#### Scenario: Stable layout
- **WHEN** the user changes the period
- **THEN** the card keeps its height and the content below it does not move

## MODIFIED Requirements

### Requirement: The skill balance counts every practice category

The system SHALL include technique, theory, repertoire, lick and improvisation time in the skill balance of the selected period — the current week, the last 30 days or the current year — and SHALL NOT omit a category from the totals or percentages.

#### Scenario: Lick time in the month
- **WHEN** the selected period includes practice blocks classified as lick
- **THEN** their minutes appear in the lick segment and count towards the period total

#### Scenario: Most practiced area
- **WHEN** lick is the category with the most accumulated time in the history
- **THEN** the dashboard reports lick as the most practiced area

#### Scenario: Week period
- **WHEN** the week period is selected
- **THEN** the balance counts only practice from Monday to today

#### Scenario: Year period
- **WHEN** the year period is selected
- **THEN** the balance counts practice from 1 January to today

### Requirement: The dashboard compares electric and acoustic practice time

The system SHALL show a semicircular balance of the classified practice time of the selected period — the current week, the last 30 days or the current year — between electric and acoustic guitar, SHALL show each type's minutes and percentage, and SHALL report time without a recorded guitar type separately instead of assigning it to either type.

#### Scenario: Both types practised
- **WHEN** the selected period has sessions recorded as electric and as acoustic
- **THEN** the chart splits the classified time between both types and shows each percentage

#### Scenario: Only one type practised
- **WHEN** the selected period has classified sessions of only one type
- **THEN** the chart shows that type with one hundred percent of the classified time and the other with zero

#### Scenario: Unclassified sessions
- **WHEN** the selected period has sessions without a recorded guitar type
- **THEN** the chart reports that time separately and does not add it to either type

#### Scenario: No classified time
- **WHEN** the selected period has no session with a recorded guitar type
- **THEN** the chart shows an empty state and explains that the guitar type is chosen during practice or edited in the session

#### Scenario: No unclassified time
- **WHEN** the selected period has classified time but none without a guitar type
- **THEN** the balance still reports the unclassified row with zero minutes

#### Scenario: Week period
- **WHEN** the week period is selected
- **THEN** the balance counts only classified time from Monday to today

#### Scenario: Year period
- **WHEN** the year period is selected
- **THEN** the balance counts classified time from 1 January to today
