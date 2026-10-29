# Spec Delta

## ADDED Requirements

### Requirement: The dashboard charts mood and focus over time

The dashboard SHALL chart mood and focus over time on the same one-to-five scale used to record them, SHALL offer a week, month and year period, and SHALL leave an interval without responses as a gap instead of drawing it as a zero.

#### Scenario: The week period
- **WHEN** the user selects the week period
- **THEN** the chart plots one point per day of the current week for each metric that has responses that day

#### Scenario: The month period
- **WHEN** the user selects the month period
- **THEN** the chart plots one value per calendar week of the current month, with the first and last weeks clipped to the month

#### Scenario: The year period
- **WHEN** the user selects the year period
- **THEN** the chart plots one value per month of the current year

#### Scenario: A day without responses
- **WHEN** an interval has no session that answered a metric
- **THEN** that interval is left as a gap for that metric and no zero value is drawn

#### Scenario: Several sessions in one interval
- **WHEN** an interval has more than one session with a value
- **THEN** the point shows the average of those values for that interval

#### Scenario: Only one metric has data
- **WHEN** the selected period has mood values but no focus values
- **THEN** the mood series is drawn and the focus series shows an empty state instead of a flat line at zero

#### Scenario: No wellbeing data in the period
- **WHEN** the selected period has no mood or focus values and the history has some elsewhere
- **THEN** the card keeps its place and period control and shows an empty state

#### Scenario: No wellbeing data at all
- **WHEN** the history has never recorded mood or focus
- **THEN** the dashboard does not show the wellbeing card

### Requirement: The wellbeing chart summarizes its period

The wellbeing chart SHALL show, for the selected period, the average of each metric, its change against the immediately preceding period of the same kind, and the number of practices that answered it, and SHALL omit the comparison when the previous period has no values.

#### Scenario: Both periods have values
- **WHEN** the selected and the previous period both contain values for a metric
- **THEN** the card shows the period average, its change and the sample count for that metric

#### Scenario: Previous period without values
- **WHEN** the selected period has values and the previous equivalent period does not
- **THEN** the card shows the period average and the sample count and states that there is no comparison

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the averages, comparisons and sample counts are recalculated for the selected period and its predecessor

### Requirement: The wellbeing chart is readable without colour or emojis

The wellbeing card SHALL identify mood and focus with text, SHALL distinguish their series by more than colour, SHALL expose each plotted value to assistive technology, and SHALL NOT use emoji characters.

#### Scenario: Reading the chart with a screen reader
- **WHEN** the user reaches the wellbeing chart with a screen reader
- **THEN** it announces what the chart represents, the period, both series and the plotted values with their intervals

#### Scenario: Distinguishing the series
- **WHEN** both series are drawn
- **THEN** each one has a visible text label and a marker or pattern that does not depend on colour alone

#### Scenario: Consulting an interval
- **WHEN** the pointer hovers an interval with values or the interval receives keyboard focus
- **THEN** a readable detail shows the interval label, the mood and focus averages and how many practices answered

#### Scenario: No emoji
- **WHEN** the wellbeing card and its detail are shown
- **THEN** no emoji character appears in them

### Requirement: A saved practice shows its wellbeing without emojis

The day detail SHALL show each stored mood and focus value with its textual label and its number on the one-to-five scale, and SHALL NOT show an emoji for it.

#### Scenario: A practice with both values
- **WHEN** the user opens a practice that recorded mood and focus
- **THEN** both appear with their label, such as "Bien" or "Enfocado", and their number out of five

#### Scenario: A practice with one value
- **WHEN** the practice recorded only one of the two metrics
- **THEN** only that metric appears and the detail keeps its layout

#### Scenario: A practice without values
- **WHEN** the practice recorded neither metric
- **THEN** nothing is shown for them and no empty block is left
