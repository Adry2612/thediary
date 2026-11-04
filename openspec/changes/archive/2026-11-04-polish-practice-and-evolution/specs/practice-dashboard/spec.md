# Spec Delta

## ADDED Requirements

### Requirement: The evolution charts animate on appearance and change

The system SHALL animate the practice rhythm bars, the skill-balance bars, the monthly heatmap and the annual calendar when they first appear or when their period, month or year changes, using only opacity and transform so no layout shifts, and SHALL finish within 500 ms with a stagger delay capped so the last element starts within 250 ms.

#### Scenario: The chart appears
- **WHEN** the evolution screen shows a chart with data
- **THEN** its bars or cells enter with the short animation and settle in their final position

#### Scenario: The period changes
- **WHEN** the user switches the period of the practice rhythm or the month of the heatmap or calendar
- **THEN** the new bars or cells animate once from their baseline

#### Scenario: The layout does not move
- **WHEN** a chart animates
- **THEN** its labels, cards and surrounding content keep their position and the page does not shift

#### Scenario: An empty chart
- **WHEN** the selected period has no practice to draw
- **THEN** the chart shows its empty state without an entrance animation

### Requirement: Chart motion does not replay or block reduced-motion users

The system SHALL NOT replay the chart animation on hover, focus or an unrelated re-render, SHALL show the final state immediately when the user prefers reduced motion, and SHALL keep every value, label and accessible name available while the animation runs or when it is skipped.

#### Scenario: The same data re-renders
- **WHEN** an unrelated state change re-renders the dashboard without changing the chart data
- **THEN** the animation does not replay

#### Scenario: Hovering a bar or cell
- **WHEN** the user points at or focuses a bar or cell
- **THEN** it shows its tooltip or focus style with no entrance animation

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** every chart is shown directly in its final state with no transition or stagger

#### Scenario: The data is readable without motion
- **WHEN** the animation is skipped or still running
- **THEN** the chart's values, labels and accessible names are already available
