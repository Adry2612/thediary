# Spec Delta

## Purpose

Defines what the practice dashboard shows and how its summaries behave: the annual calendar's hover card, the skill balance's floating summary, the schedule card's labels, the streak recognition, and the dashboard's entry points.

## ADDED Requirements

### Requirement: The annual calendar keeps the day summary on its day

The system SHALL keep the annual calendar's day summary on the day under the pointer, SHALL delay switching to another day while a summary is already open, and SHALL cancel a pending switch when the pointer enters the summary. The summary MUST remain interactive and MUST close when the pointer leaves both the day and the summary, when the page scrolls, when the viewport is resized, or when Escape is pressed.

#### Scenario: Opening a day
- **WHEN** the pointer enters a day of the annual calendar
- **THEN** its summary opens immediately without waiting for a dwell

#### Scenario: Travelling from the day to the summary
- **WHEN** the summary is open and the pointer crosses neighbouring day cells on its way to the summary
- **THEN** the summary keeps the original day and stays open until the pointer enters the summary

#### Scenario: Crossing days briefly
- **WHEN** the pointer moves quickly across several annual-calendar cells
- **THEN** the summary does not switch day until the pointer rests on one cell for the hover-intent delay

#### Scenario: Choosing another day
- **WHEN** the pointer rests on a different day long enough to commit the switch
- **THEN** the summary shows the new day without closing and reopening

#### Scenario: Days without practice
- **WHEN** the pointer enters an annual-calendar day without saved practice
- **THEN** the summary shows that day's empty state and can still be entered

#### Scenario: Keyboard focus
- **WHEN** a day receives keyboard focus
- **THEN** its summary opens immediately, without the pointer's hover-intent delay

#### Scenario: Dismissing the summary
- **WHEN** the user scrolls the page, resizes the viewport or presses Escape
- **THEN** the annual calendar's summary closes and does not remain pinned to the old position

### Requirement: The skill balance shows its summary in a floating card

The system SHALL show a floating summary card for the skill under the pointer or keyboard focus with the minutes practised this month, its percentage of the month and the number of sessions that practised it. The centre of the chart SHALL keep showing the monthly total, and the card MUST stay inside the viewport without blocking the arc or legend row that opened it.

#### Scenario: Hovering a donut arc
- **WHEN** the pointer enters an arc of the skill balance
- **THEN** a floating card near the arc shows that skill's minutes, percentage and session count

#### Scenario: Hovering a legend row
- **WHEN** the pointer enters a row of the skill balance legend
- **THEN** the same summary appears for that skill

#### Scenario: Keeping the monthly total
- **WHEN** the pointer is over an arc or a legend row
- **THEN** the centre of the chart still shows the monthly total instead of replacing it

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

### Requirement: The schedule card keeps labels clear of their bars

The system SHALL lay out each schedule row with a dedicated label column wide enough for the longest weekday or time-band label, a bar column and a value column, and SHALL keep visible spacing between them so that no label overlaps a bar or a value at any supported width.

#### Scenario: Time-band labels
- **WHEN** the user opens the schedule card
- **THEN** labels such as "Madrugada" and "Mañana" fit entirely inside their column without crossing the bar

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown at 320 pixels wide
- **THEN** every schedule row still separates label, bar and value without overlap

#### Scenario: Empty rows
- **WHEN** a weekday or time band has no practice
- **THEN** its label, empty bar and "—" value keep the same separated layout

### Requirement: A long streak is recognised with an animated flame

When the current streak reaches 7 consecutive practice days, the system SHALL show a decorative animated flame beside the streak value together with a visible short message. Below 7 days the flame and the message MUST NOT appear. The flame MUST be hidden from assistive technology, and the animation MUST stop when the user prefers reduced motion.

#### Scenario: Reaching seven days
- **WHEN** the current streak is 7 or more days
- **THEN** the streak card shows the animated flame and the message

#### Scenario: Shorter streak
- **WHEN** the current streak is below 7 days
- **THEN** the streak card shows only the streak value and its regular description

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the flame is still shown but does not animate

#### Scenario: Screen reader
- **WHEN** a screen reader reads the streak card
- **THEN** the flame is not announced and the message is read as text

### Requirement: The dashboard does not offer a quick-access suggested practice

The dashboard SHALL NOT show the quick-access card that asks how much time the user has, SHALL NOT generate a suggested practice plan from a `minutes` value, and MUST keep the regular practice screen's default plan when that value is absent or ignored.

#### Scenario: Opening the dashboard
- **WHEN** the user opens the dashboard
- **THEN** no quick-access card or "how much time do you have" question is shown

#### Scenario: Opening the practice screen with minutes
- **WHEN** the user opens `/practice?minutes=30`
- **THEN** the practice screen ignores the value and shows its default plan instead of a 30-minute suggested split

#### Scenario: Opening the practice screen normally
- **WHEN** the user opens `/practice` without a time value
- **THEN** the practice screen shows the same default plan as before

## REMOVED Requirements

### Requirement: The skill balance summarizes each skill

**Reason**: The centre-swap interaction is replaced by a floating summary card so the monthly total stays visible while a skill is inspected.

**Migration**: Use the floating card added by "The skill balance shows its summary in a floating card". The donut arcs, the legend rows and keyboard focus remain the entry points.
