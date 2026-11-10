# Spec Delta

## ADDED Requirements

### Requirement: Dashboard periods are rolling windows ending today

Every dashboard period SHALL be a rolling window that ends today. The week SHALL be the seven days ending today, the month SHALL be the thirty days ending today, and the year SHALL be the twelve calendar months ending with the current month. No dashboard window SHALL include days after today.

#### Scenario: Middle of a week
- **WHEN** today is Tuesday and the week period is selected
- **THEN** the week starts on the previous Wednesday and ends today

#### Scenario: Middle of a month
- **WHEN** today is the 10th and the month period is selected
- **THEN** the window starts thirty days before today and ends on the 10th

#### Scenario: Middle of a year
- **WHEN** today is 10 March 2026 and the year period is selected
- **THEN** the window starts on 1 April 2025 and ends on 10 March 2026

#### Scenario: Practice dated after today
- **WHEN** the history contains a practice dated after today
- **THEN** it does not appear in any dashboard window, chart or metric until its day arrives

### Requirement: The dashboard shows the longest streak

The dashboard SHALL show the longest run of consecutive calendar days with at least one practice in the full history, expressed in days, beside the current streak. The longest streak SHALL NOT follow any period selector and SHALL show zero when the history has no practice.

#### Scenario: A historical record
- **WHEN** the full history contains a run of fourteen consecutive practice days and the current streak is three
- **THEN** the longest streak shows fourteen days while the current streak keeps showing three

#### Scenario: The current streak is the record
- **WHEN** the current run is the longest in the history
- **THEN** both cards show the same number of days

#### Scenario: No practice
- **WHEN** the history has no practice
- **THEN** the longest streak shows zero days

#### Scenario: Changing the dashboard period
- **WHEN** the user switches the week, month or year period
- **THEN** the longest streak keeps reporting the full-history record

#### Scenario: Reading the card
- **WHEN** assistive technology reaches the longest streak card
- **THEN** it announces the label and the number of days

### Requirement: The top weekly summary keeps the calendar week

The weekly summary at the top of the dashboard SHALL keep describing the current Monday-to-Sunday calendar week, including days after today, and SHALL NOT follow any dashboard period selector.

#### Scenario: A mid-week visit
- **WHEN** the dashboard opens on a Wednesday
- **THEN** the top weekly summary still shows Monday to Sunday of the current week

#### Scenario: Changing another card's period
- **WHEN** the user changes the period of the rhythm chart or of a balance
- **THEN** the top weekly summary does not change

## RENAMED Requirements

- FROM: `### Requirement: Period comparisons cover the same elapsed span`
- TO: `### Requirement: Period comparisons cover the preceding window of the same length`
- FROM: `### Requirement: The monthly figures cover the last 30 days`
- TO: `### Requirement: The summary figures follow the selected period`
- FROM: `### Requirement: The dashboard ranks the most practiced content`
- TO: `### Requirement: The dashboard ranks the most practiced content of the period`

## MODIFIED Requirements

### Requirement: The skill balance counts every practice category

The system SHALL include technique, theory, repertoire, lick and improvisation time in the skill balance of the selected rolling window — the seven days, the thirty days or the twelve months ending today — and SHALL NOT omit a category from the totals or percentages.

#### Scenario: Lick time in the month
- **WHEN** the selected period includes practice blocks classified as lick
- **THEN** their minutes appear in the lick segment and count towards the period total

#### Scenario: Most practiced area
- **WHEN** lick is the category with the most accumulated time in the selected period
- **THEN** the dashboard reports lick as the most practiced area

#### Scenario: Week period
- **WHEN** the week period is selected
- **THEN** the balance counts only practice from the seven days ending today

#### Scenario: Year period
- **WHEN** the year period is selected
- **THEN** the balance counts practice from the first day of the month eleven months before today's month through today

### Requirement: The dashboard compares electric and acoustic practice time

The system SHALL show a semicircular balance of the classified practice time of the selected rolling window — the seven days, the thirty days or the twelve months ending today — between electric and acoustic guitar, SHALL show each type's minutes and percentage, and SHALL report time without a recorded guitar type separately instead of assigning it to either type.

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
- **THEN** the balance counts only classified time from the seven days ending today

#### Scenario: Year period
- **WHEN** the year period is selected
- **THEN** the balance counts classified time from the first day of the month eleven months before today's month through today

### Requirement: The dashboard ranks the most practiced content of the period

The system SHALL show the most practised song, technique and theory topic of the same rolling window as the practice-rhythm period, grouped by block name for technique and theory, with their practised time and session count, and SHALL show an empty state for a ranking with no data in that window.

#### Scenario: A song practised through its blocks
- **WHEN** blocks linked to a repertoire song have accumulated practice time inside the selected period
- **THEN** the song appears in the ranking with its current title, total time and session count

#### Scenario: Practice outside the period
- **WHEN** a song, technique or theory topic was practised only before the selected window
- **THEN** it does not appear in the ranking

#### Scenario: Technique blocks
- **WHEN** several technique blocks share a name with differences in case or accents
- **THEN** their time is grouped under a single technique entry

#### Scenario: Theory blocks
- **WHEN** several theory blocks share a name with differences in case or accents
- **THEN** their time is grouped under a single theory topic entry

#### Scenario: A deleted song
- **WHEN** a practiced block references a song that is no longer in the repertoire
- **THEN** the ranking uses the block name stored with the practice instead of dropping the time

#### Scenario: Changing the rhythm period
- **WHEN** the user changes the practice-rhythm period
- **THEN** the rankings are recalculated for the same window

#### Scenario: No data for a ranking
- **WHEN** the selected period has no song, technique or theory practice
- **THEN** that ranking shows an empty state instead of a zero-valued first position

### Requirement: The practice rhythm card summarizes the selected period

The practice rhythm card SHALL show, for the selected rolling window ending today, the period total, the number of sessions, the average time per session, the best day/week/month and how the total compares with the preceding window of the same length.

#### Scenario: Period with practice
- **WHEN** the selected period contains at least one practice session
- **THEN** the card shows the period total, the session count, the average time per session, the name and time of the best day/week/month, and the change against the preceding window

#### Scenario: Previous period without practice
- **WHEN** the selected period contains practice but the preceding window does not
- **THEN** the comparison states that there is no previous data instead of showing a percentage

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the total, session count, average, best unit and comparison are recalculated for the newly selected period

#### Scenario: Empty period
- **WHEN** the selected period contains no practice
- **THEN** the card keeps its layout, shows a zero total and no best unit, and keeps the existing empty-chart message

#### Scenario: Mid-week
- **WHEN** today is Wednesday and the week period is selected
- **THEN** the chart shows the seven days ending today, starting on the previous Thursday

#### Scenario: First day of a month
- **WHEN** a new calendar month has just started and there was practice in the previous one
- **THEN** the card shows the practice of the last 30 days and compares it with the 30 days before, instead of starting from zero

#### Scenario: The month chart buckets
- **WHEN** the month period is selected
- **THEN** the chart groups the 30 days ending today into Monday-to-Sunday buckets, the first and last clipped to the window, and labels a bucket that crosses a month boundary with both months

#### Scenario: The year chart buckets
- **WHEN** the year period is selected
- **THEN** the chart shows one bucket per calendar month of the twelve-month window, the first and last clipped to the window, and the last bucket ends today

### Requirement: The dashboard charts mood and focus over time

The dashboard SHALL show the wellbeing card only when mood or focus is enabled in Settings and at least one of the enabled metrics has recorded data. It SHALL chart and summarize only the enabled metrics over time on the same one-to-five scale used to record them, SHALL offer a week, month and year period over the rolling windows ending today, and SHALL leave an interval without responses as a gap instead of drawing it as a zero.

#### Scenario: The week period
- **WHEN** the user selects the week period
- **THEN** the chart plots one point per day of the seven days ending today for each metric that has responses that day

#### Scenario: The month period
- **WHEN** the user selects the month period
- **THEN** the chart plots one value per calendar week of the thirty days ending today, with the first and last weeks clipped to the window

#### Scenario: The year period
- **WHEN** the user selects the year period
- **THEN** the chart plots one value per calendar month of the twelve-month window ending with the current month

#### Scenario: A day without responses
- **WHEN** an interval has no session that answered a metric
- **THEN** that interval is left as a gap for that metric and no zero value is drawn

#### Scenario: Several sessions in one interval
- **WHEN** an interval has more than one session with a value
- **THEN** the point shows the average of those values for that interval

#### Scenario: Only one metric has data
- **WHEN** mood is enabled and has values while focus is disabled or has no values in the period
- **THEN** only the mood series is drawn and no zero is drawn for focus

#### Scenario: No wellbeing data in the period
- **WHEN** the selected period has no values for the enabled metrics and the history has some elsewhere
- **THEN** the card keeps its place and period control and shows an empty state

#### Scenario: Wellbeing metrics are off
- **WHEN** neither mood nor focus is enabled in Settings
- **THEN** the dashboard does not show the wellbeing card even if the history has old values

#### Scenario: No wellbeing data at all
- **WHEN** the enabled metrics have never recorded a value
- **THEN** the dashboard does not show the wellbeing card

### Requirement: Period comparisons cover the preceding window of the same length

The system SHALL compare each selected rolling window with the immediately preceding window of the same length: the seven days before the selected week, the thirty days before the selected month, or the same twelve months one year earlier. The previous window SHALL end on the day before the current window starts.

#### Scenario: Middle of a week
- **WHEN** today is Tuesday 11 November 2026 and the week period is selected
- **THEN** the current side covers 5 November to 11 November and the previous side covers 29 October to 4 November

#### Scenario: Any day of the month
- **WHEN** today is 15 November 2026 and the month period is selected
- **THEN** the current side covers 17 October to 15 November and the previous side covers 17 September to 16 October

#### Scenario: First day of a month
- **WHEN** today is 1 November and the month period is selected
- **THEN** the current side covers 3 October to 1 November, so practice from the end of October still counts

#### Scenario: Middle of a year
- **WHEN** today is 10 March 2026 and the year period is selected
- **THEN** the current side covers 1 April 2025 to 10 March 2026 and the previous side covers 1 April 2024 to 10 March 2025

#### Scenario: Leap day
- **WHEN** today is 29 February 2028 and the year period is selected
- **THEN** the previous side ends on 28 February 2027

#### Scenario: Practice dated after today
- **WHEN** the history contains a practice dated after today
- **THEN** it is excluded from both the current and the previous window

### Requirement: The summary figures follow the selected period

The system SHALL compute the dashboard metric cards — practice time, session count, average BPM, practice hours and most-practised area — over the same rolling window as the practice-rhythm period, SHALL update them when that period changes, and SHALL NOT use the full history. The current and longest streak cards SHALL remain historical.

#### Scenario: Default period
- **WHEN** the dashboard opens
- **THEN** the metric cards cover the seven days ending today, the same window as the rhythm chart

#### Scenario: Changing the rhythm period
- **WHEN** the user selects the month or year period on the rhythm chart
- **THEN** the metric cards are recalculated for that same window

#### Scenario: First day of a calendar month
- **WHEN** today is 1 November and the rhythm period is month
- **THEN** the figures include the practice from the end of October instead of showing zero

#### Scenario: Rolling over a month boundary
- **WHEN** the selected window crosses from one calendar month into the next
- **THEN** the figures count practice from both calendar months once each

#### Scenario: Old practice leaves the window
- **WHEN** a practice falls outside the selected window
- **THEN** it does not count in the practice time, the session count, the average BPM, the hours or the most-practised area

#### Scenario: Labels name the window
- **WHEN** the metric cards are shown
- **THEN** their labels and descriptions refer to the selected period instead of a fixed 30 days or the full history

#### Scenario: Empty period
- **WHEN** the selected period contains no practice
- **THEN** the cards keep their layout and show zero or their empty value instead of history totals

#### Scenario: Streaks are not windowed
- **WHEN** the user changes the rhythm period
- **THEN** the current streak and the longest streak keep their historical values

### Requirement: A comparison names the span it compares

The system SHALL word every period comparison on the practice rhythm card and the wellbeing card so that it states which rolling window it compares for the selected period, instead of a generic previous period.

#### Scenario: Month comparison
- **WHEN** the month period is selected and a comparison is shown
- **THEN** the wording refers to the 30 days before the window

#### Scenario: Week comparison
- **WHEN** the week period is selected and a comparison is shown
- **THEN** the wording refers to the 7 days before the window

#### Scenario: Year comparison
- **WHEN** the year period is selected and a comparison is shown
- **THEN** the wording refers to the same months one year earlier
