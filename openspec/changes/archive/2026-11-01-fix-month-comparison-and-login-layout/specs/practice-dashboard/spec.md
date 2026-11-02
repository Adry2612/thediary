# Spec Delta

## ADDED Requirements

### Requirement: Period comparisons cover the same elapsed span

The system SHALL compare the selected week, month or year with a comparable preceding span: the same elapsed days of the previous week, the 30 days before the selected 30-day month, or the same stretch of the previous year. The month period SHALL be the 30 days ending today, never the calendar month.

#### Scenario: Any day of the month
- **WHEN** today is 15 November and the month period is selected
- **THEN** the current side covers 17 October to 15 November and the previous side covers 17 September to 16 October

#### Scenario: First day of a month
- **WHEN** today is 1 November and the month period is selected
- **THEN** the current side covers 3 October to 1 November, so practice from the end of October still counts

#### Scenario: Middle of a week
- **WHEN** today is a Wednesday and the week period is selected
- **THEN** the current side covers Monday to Wednesday and the previous side covers Monday to Wednesday of the previous week

#### Scenario: Middle of a year
- **WHEN** today is 10 March and the year period is selected
- **THEN** the previous side covers 1 January to 10 March of the previous year

#### Scenario: Leap day
- **WHEN** today is 29 February and the year period is selected
- **THEN** the previous side ends on 28 February of the previous year

#### Scenario: Practice dated after today
- **WHEN** the selected week or year includes days after today and one of them has practice
- **THEN** that practice is left out of the comparison until its day arrives, while it still appears in the period total and in the chart

### Requirement: The monthly figures cover the last 30 days

The system SHALL compute the month figures — the practice time, the skill balance, the guitar balance and the average BPM — over the 30 days ending today, SHALL word them as the last 30 days instead of this month, and SHALL NOT reset them on the first day of a calendar month.

#### Scenario: First day of a calendar month
- **WHEN** today is 1 November and there was practice in October
- **THEN** the month figures include that October practice instead of showing zero

#### Scenario: Labels name the window
- **WHEN** the month figures are shown
- **THEN** their labels refer to the last 30 days, and the month option of the period selector reads 30 days

#### Scenario: Rolling over a month boundary
- **WHEN** the 30-day window crosses from one calendar month into the next
- **THEN** practice from both calendar months is counted once each

#### Scenario: Old practice leaves the window
- **WHEN** a practice is older than 30 days
- **THEN** it does not count in the month figures, the month chart or the month comparison

### Requirement: A comparison names the span it compares

The system SHALL word every period comparison on the practice rhythm card and the wellbeing card so that it states which span it compares for the selected period, instead of a generic previous period.

#### Scenario: Month comparison
- **WHEN** the month period is selected and a comparison is shown
- **THEN** the wording refers to the 30 days before the window

#### Scenario: Week comparison
- **WHEN** the week period is selected and a comparison is shown
- **THEN** the wording refers to the same days of the previous week

#### Scenario: Year comparison
- **WHEN** the year period is selected and a comparison is shown
- **THEN** the wording refers to the same stretch of the previous year

## MODIFIED Requirements

### Requirement: The practice rhythm card summarizes the selected period

The practice rhythm card SHALL show, for the selected period, the period total, the number of sessions, the average time per session, the best day/week/month and how the total compares with the same elapsed span of the previous equivalent period, where the month period is the last 30 days.

#### Scenario: Period with practice
- **WHEN** the selected period contains at least one practice session
- **THEN** the card shows the period total, the session count, the average time per session, the name and time of the best day/week/month, and the change against the comparable previous span

#### Scenario: Previous period without practice
- **WHEN** the selected period contains practice but the comparable previous span does not
- **THEN** the comparison states that there is no previous data instead of showing a percentage

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the total, session count, average, best unit and comparison are recalculated for the newly selected period

#### Scenario: Empty period
- **WHEN** the selected period contains no practice
- **THEN** the card keeps its layout, shows a zero total and no best unit, and keeps the existing empty-chart message

#### Scenario: First day of a month
- **WHEN** a new calendar month has just started and there was practice in the previous one
- **THEN** the card shows the practice of the last 30 days and compares it with the 30 days before, instead of starting from zero

#### Scenario: The month chart buckets
- **WHEN** the month period is selected
- **THEN** the chart groups the 30 days ending today into Monday-to-Sunday buckets, the first and last clipped to the window, and labels a bucket that crosses a month boundary with both months

### Requirement: The wellbeing chart summarizes its period

The wellbeing chart SHALL show, for the selected period, the average of each metric, its change against a comparable previous span of the same kind, and the number of practices that answered it, and SHALL omit the comparison when that span has no values.

#### Scenario: Both periods have values
- **WHEN** the selected period and the comparable previous span both contain values for a metric
- **THEN** the card shows the period average, its change and the sample count for that metric

#### Scenario: Previous period without values
- **WHEN** the selected period has values and the comparable previous span does not
- **THEN** the card shows the period average and the sample count and states that there is no comparison

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the averages, comparisons and sample counts are recalculated for the selected period and the comparable previous span

#### Scenario: Month answers older than 30 days
- **WHEN** it is the month period and an answer is older than the 30-day window
- **THEN** that answer does not count in the average or in the comparison

### Requirement: The skill balance counts every practice category

The system SHALL include technique, theory, repertoire, lick and improvisation time in the skill balance of the last 30 days, and SHALL NOT omit a category from the totals or percentages.

#### Scenario: Lick time in the month
- **WHEN** the last 30 days include practice blocks classified as lick
- **THEN** their minutes appear in the lick segment and count towards the total

#### Scenario: Most practiced area
- **WHEN** lick is the category with the most accumulated time in the history
- **THEN** the dashboard reports lick as the most practiced area

### Requirement: The dashboard compares electric and acoustic practice time

The system SHALL show a semicircular balance of the classified practice time of the last 30 days between electric and acoustic guitar, SHALL show each type's minutes and percentage, and SHALL report time without a recorded guitar type separately instead of assigning it to either type.

#### Scenario: Both types practised
- **WHEN** the last 30 days have sessions recorded as electric and as acoustic
- **THEN** the chart splits the classified time between both types and shows each percentage

#### Scenario: Only one type practised
- **WHEN** the last 30 days have classified sessions of only one type
- **THEN** the chart shows that type with one hundred percent of the classified time and the other with zero

#### Scenario: Unclassified sessions
- **WHEN** the last 30 days have sessions without a recorded guitar type
- **THEN** the chart reports that time separately and does not add it to either type

#### Scenario: No classified time
- **WHEN** the last 30 days have no session with a recorded guitar type
- **THEN** the chart shows an empty state and explains that the guitar type is chosen during practice or edited in the session

### Requirement: The skill balance shows its summary in a floating card

The system SHALL show a floating summary card for the skill under the pointer or keyboard focus with the minutes practised in the last 30 days, its percentage of that window and the number of sessions that practised it. The centre of the chart SHALL keep showing the window total, and the card MUST stay inside the viewport without blocking the arc or legend row that opened it.

#### Scenario: Hovering a donut arc
- **WHEN** the pointer enters an arc of the skill balance
- **THEN** a floating card near the arc shows that skill's minutes, percentage and session count

#### Scenario: Hovering a legend row
- **WHEN** the pointer enters a row of the skill balance legend
- **THEN** the same summary appears for that skill

#### Scenario: Keeping the monthly total
- **WHEN** the pointer is over an arc or a legend row
- **THEN** the centre of the chart still shows the total instead of replacing it

#### Scenario: Moving between skills
- **WHEN** the pointer moves from one skill to another
- **THEN** the card updates to the new skill without closing

#### Scenario: Leaving the card
- **WHEN** the pointer leaves the chart and its legend, or moves focus away
- **THEN** the card disappears and the chart is left unchanged

#### Scenario: Chart near the viewport edge
- **WHEN** the chart is close to a window edge
- **THEN** the card is repositioned or clamped so it remains fully visible

#### Scenario: Keyboard focus
- **WHEN** the user focuses a skill row with the keyboard
- **THEN** the card shows that skill's summary and the row's accessible name stays available

#### Scenario: Pointing through the card
- **WHEN** the card appears over another legend row
- **THEN** the card does not intercept the pointer and the row underneath can still be hovered

#### Scenario: Keyboard dismissal
- **WHEN** the card is visible and the user presses Escape
- **THEN** the card disappears
