# Spec Delta

## ADDED Requirements

### Requirement: The dashboard summarizes mood and focus

When at least one practice in the selected period carries a value, the dashboard SHALL show the average mood and the average focus of that period together with their trend against the previous period, SHALL express the values on the same five-point scale used to capture them, and SHALL NOT show a chart or a zero for a metric with no data.

#### Scenario: Both metrics have data
- **WHEN** the selected period contains practices with mood and focus
- **THEN** the dashboard shows both averages and their trend against the previous period

#### Scenario: Only one metric has data
- **WHEN** the period contains mood values but no focus values
- **THEN** the dashboard shows the mood summary and an empty state for focus instead of a zero

#### Scenario: No metric has data
- **WHEN** the period contains no mood or focus values
- **THEN** neither summary is shown and the rest of the dashboard keeps its layout

#### Scenario: Reading without colour
- **WHEN** a summary shows its trend
- **THEN** the direction is readable as text and not only through colour

#### Scenario: Changing the period
- **WHEN** the user changes the dashboard period
- **THEN** both summaries recompute for that period

### Requirement: A saved practice shows its mood and focus

The day detail SHALL show the mood and focus recorded for each practice of the day with their emoji and their label, and SHALL omit them without leaving a gap when the practice has no value.

#### Scenario: A practice with both values
- **WHEN** the user opens a day whose practice recorded mood and focus
- **THEN** that practice shows both values with their emoji and readable label

#### Scenario: A practice without values
- **WHEN** the practice has no mood or focus stored
- **THEN** nothing is shown for those metrics and the practice details keep their layout
