# Spec Delta

## Purpose

Defines what the practice dashboard shows and how its summaries behave: the hover card of a practice day, the duration format of the time chart, the per-skill and per-guitar balances, the most-practiced content, the weekly and daily practice schedule, and the tempo progress comparison.

## ADDED Requirements

### Requirement: The day summary can be entered with the pointer

The system SHALL keep a practice day's hover summary open while the pointer moves from the day to the summary itself, so the user can read or scroll it, and SHALL close it only after the pointer leaves both.

#### Scenario: Moving the pointer onto the summary
- **WHEN** the summary is open and the pointer leaves the day but enters the summary
- **THEN** the summary stays open and the user can interact with it

#### Scenario: Leaving the summary
- **WHEN** the pointer leaves the summary without entering another day
- **THEN** the summary closes after a short grace period

#### Scenario: Moving to another day
- **WHEN** the pointer moves from one day to another day with practice
- **THEN** the summary shows the new day instead of closing and reopening

#### Scenario: No practice that day
- **WHEN** the pointer enters a day without saved practice
- **THEN** the summary shows that day's empty state and can still be entered

### Requirement: The day summary closes when the page moves

The system SHALL close the day summary when the page scrolls or the viewport is resized, and SHALL NOT close it when the user scrolls the summary's own session list.

#### Scenario: Scrolling the page
- **WHEN** the summary is open and the page scrolls vertically or horizontally
- **THEN** the summary closes instead of remaining pinned to the old screen position

#### Scenario: Scrolling inside the summary
- **WHEN** the summary has more sessions than fit and the user scrolls its internal list
- **THEN** the summary stays open

#### Scenario: Resizing the window
- **WHEN** the summary is open and the viewport is resized
- **THEN** the summary closes

#### Scenario: Keyboard dismissal
- **WHEN** the summary is open and the user presses Escape
- **THEN** the summary closes

#### Scenario: Keyboard focus
- **WHEN** the user reaches a practice day with the keyboard
- **THEN** the summary opens and stays open while that day keeps the focus

### Requirement: Long practice durations are expressed in hours and minutes

The system SHALL present practice durations of one hour or more in the time chart's summary as hours and minutes, SHALL present shorter durations in minutes, and SHALL keep the accessible name of each bar consistent with the visible value.

#### Scenario: A bar over one hour
- **WHEN** the user points at a bar whose practice time is 300 minutes
- **THEN** the summary reads "5 h"

#### Scenario: A bar with hours and minutes
- **WHEN** the user points at a bar whose practice time is 252 minutes
- **THEN** the summary reads "4 h 12 min"

#### Scenario: A short bar
- **WHEN** the user points at a bar whose practice time is 45 minutes
- **THEN** the summary reads "45 min"

### Requirement: The skill balance summarizes each skill

The system SHALL show, for the skill under the pointer or keyboard focus, the minutes practised this month, its percentage of the month and the number of sessions that practised it, and SHALL restore the monthly total when the pointer leaves the card.

#### Scenario: Hovering a donut arc
- **WHEN** the pointer enters an arc of the skill balance
- **THEN** the centre of the chart shows that skill's minutes, percentage and session count

#### Scenario: Hovering a legend row
- **WHEN** the pointer enters a row of the skill balance legend
- **THEN** the centre of the chart shows the same summary for that skill

#### Scenario: Moving inside the card
- **WHEN** the pointer moves from one skill to another inside the card
- **THEN** the summary changes to the new skill without closing

#### Scenario: Leaving the card
- **WHEN** the pointer leaves the skill balance card
- **THEN** the centre shows the monthly total again

#### Scenario: Keyboard focus
- **WHEN** the user focuses a skill row with the keyboard
- **THEN** the summary for that skill is shown

### Requirement: The skill balance counts every practice category

The system SHALL include technique, theory, repertoire, lick and improvisation time in the monthly skill balance, and SHALL NOT omit a category from the totals or percentages.

#### Scenario: Lick time in the month
- **WHEN** the month includes practice blocks classified as lick
- **THEN** their minutes appear in the lick segment and count towards the monthly total

#### Scenario: Most practiced area
- **WHEN** lick is the category with the most accumulated time in the history
- **THEN** the dashboard reports lick as the most practiced area

### Requirement: The dashboard compares electric and acoustic practice time

The system SHALL show a semicircular balance of the current month's classified practice time between electric and acoustic guitar, SHALL show each type's minutes and percentage, and SHALL report time without a recorded guitar type separately instead of assigning it to either type.

#### Scenario: Both types practised
- **WHEN** the month has sessions recorded as electric and as acoustic
- **THEN** the chart splits the classified time between both types and shows each percentage

#### Scenario: Only one type practised
- **WHEN** the month has classified sessions of only one type
- **THEN** the chart shows that type with one hundred percent of the classified time and the other with zero

#### Scenario: Unclassified sessions
- **WHEN** the month has sessions without a recorded guitar type
- **THEN** the chart reports that time separately and does not add it to either type

#### Scenario: No classified time
- **WHEN** the month has no session with a recorded guitar type
- **THEN** the chart shows an empty state and explains that the guitar type is chosen during practice or edited in the session

### Requirement: The dashboard ranks the most practiced content

The system SHALL show the most practised song, technique and theory topic over the full history, grouped by block name for technique and theory, with their practised time and session count, and SHALL show an empty state for a ranking with no data.

#### Scenario: A song practised through its blocks
- **WHEN** blocks linked to a repertoire song have accumulated practice time
- **THEN** the song appears in the ranking with its current title, total time and session count

#### Scenario: Technique blocks
- **WHEN** several technique blocks share a name with differences in case or accents
- **THEN** their time is grouped under a single technique entry

#### Scenario: Theory blocks
- **WHEN** several theory blocks share a name with differences in case or accents
- **THEN** their time is grouped under a single theory topic entry

#### Scenario: A deleted song
- **WHEN** a practiced block references a song that is no longer in the repertoire
- **THEN** the ranking uses the block name stored with the practice instead of dropping the time

#### Scenario: No data for a ranking
- **WHEN** the history has no song, technique or theory practice
- **THEN** that ranking shows an empty state instead of a zero-valued first position

### Requirement: The dashboard shows when practice happens

The system SHALL distribute the full history's practice time by weekday and by time of day using the user's local time, and SHALL identify the weekday and the time band with the most practice.

#### Scenario: Weekday distribution
- **WHEN** the user opens the schedule card
- **THEN** each weekday shows the time practised on that weekday

#### Scenario: Time bands
- **WHEN** the user opens the schedule card
- **THEN** the card groups practice into morning, afternoon, evening and night

#### Scenario: A session crossing midnight
- **WHEN** a session starts at 23:50 and ends after midnight
- **THEN** its time is assigned to the day and band in which it started

#### Scenario: No practice
- **WHEN** the history is empty
- **THEN** the schedule card shows an empty state

### Requirement: Tempo progress compares like with like

The system SHALL compare the current rolling window (last 7 or last 30 days) with the immediately preceding window of the same length, SHALL compute the change per practised content using that content's recent level in each window, SHALL weight the changes by current practice time, and SHALL report the aggregate BPM and percentage change with the number of contents compared.

#### Scenario: Two contents improve at different rates
- **WHEN** one content rises from 80 to 82 BPM and another from 100 to 120 BPM in the window, and both have practice time
- **THEN** the card reports a weighted average change instead of comparing the raw global average of all sessions

#### Scenario: A content practised in only one window
- **WHEN** a content appears only in the current window or only in the previous one
- **THEN** it is excluded from the comparison

#### Scenario: Content with several sessions
- **WHEN** a content has several sessions in a window
- **THEN** the card uses the time-weighted level of up to its three most recent sessions instead of a single session

#### Scenario: Main movers
- **WHEN** several contents are compared
- **THEN** the card lists the contents with the largest positive and negative BPM changes

#### Scenario: Nothing comparable
- **WHEN** no content was practised in both windows
- **THEN** the card shows an empty state that explains that the same song, technique, theory topic or lick must be practised in both periods

#### Scenario: Small sample
- **WHEN** only one or two contents are compared
- **THEN** the card marks the result as a small sample

#### Scenario: Period choice
- **WHEN** the user switches between week and month
- **THEN** the card compares the corresponding rolling windows and updates its labels

### Requirement: Tempo progress only uses recorded metronome data

The system SHALL compute tempo progress only from sessions that recorded BPM, SHALL use the session average only when a legacy session has a single block, SHALL exclude legacy multi-block sessions from per-content comparison, and SHALL state that the metric comes from sessions with the metronome.

#### Scenario: Session without metronome
- **WHEN** a session has no recorded BPM
- **THEN** it does not affect the tempo progress

#### Scenario: Legacy single-block session
- **WHEN** an older session has one block and a recorded session average
- **THEN** that average is used for the block's content

#### Scenario: Legacy multi-block session
- **WHEN** an older session has several blocks and only a session average
- **THEN** the session is not attributed to any single content

#### Scenario: Metric explanation
- **WHEN** the tempo card is shown
- **THEN** it states that the metric uses sessions practised with the metronome

### Requirement: The new dashboard charts are accessible

The system SHALL give every new chart an accessible name, SHALL expose its values as text in addition to colour or arc length, and SHALL let every interactive element be reached and read with the keyboard.

#### Scenario: Reading a chart with a screen reader
- **WHEN** the user reaches a new chart with a screen reader
- **THEN** the chart announces what it represents and its values

#### Scenario: Colour is not the only signal
- **WHEN** a chart distinguishes categories by colour
- **THEN** each category also has a text label and value
