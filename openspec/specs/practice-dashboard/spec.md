# practice-dashboard Specification

## Purpose
Defines what the practice dashboard shows and how its summaries behave: the hover card of a practice day, the duration format of the time chart, the per-skill and per-guitar balances, the most-practiced content, the weekly and daily practice schedule, and the tempo progress comparison.

## Requirements

### Requirement: The day summary can be entered with the pointer

The system SHALL keep the weekly summary's hover summary open while the pointer moves from the day to the summary itself, so the user can read or scroll it, and SHALL close it only after the pointer leaves both.

#### Scenario: Moving the pointer onto the summary
- **WHEN** the weekly summary is open and the pointer leaves the day but enters the summary
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

The system SHALL close the weekly summary's floating day summary when the page scrolls or the viewport is resized, and SHALL NOT close it when the user scrolls the summary's own session list.

#### Scenario: Scrolling the page
- **WHEN** the weekly summary's floating card is open and the page scrolls vertically or horizontally
- **THEN** the card closes instead of remaining pinned to the old screen position

#### Scenario: Scrolling inside the summary
- **WHEN** the card has more sessions than fit and the user scrolls its internal list
- **THEN** the card stays open

#### Scenario: Resizing the window
- **WHEN** the card is open and the viewport is resized
- **THEN** the card closes

#### Scenario: Keyboard dismissal
- **WHEN** the card is open and the user presses Escape
- **THEN** the card closes

#### Scenario: Keyboard focus
- **WHEN** the user reaches a practice day with the keyboard
- **THEN** the card opens and stays open while that day keeps the focus

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

### Requirement: The dashboard lays its insight cards in equal pairs

The system SHALL place the practice rhythm card and the skill balance in the same responsive row, SHALL place the guitar balance and tempo progress in the next row, and SHALL give the two cards of each row the same width and height on wide viewports.

#### Scenario: Wide viewport
- **WHEN** the dashboard is shown at a wide viewport
- **THEN** the rhythm card and the skill balance start on the same row with equal width and height, and the guitar balance and tempo progress do the same on the following row

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown at a narrow viewport and the rows stack
- **THEN** every card takes the full available width without horizontal overflow

#### Scenario: Period summary inside the narrower card
- **WHEN** the rhythm card shares its row with the skill balance
- **THEN** its period summary stays fully readable, with its figures arranged in two columns

### Requirement: The rhythm chart tooltip details each bucket

The system SHALL show, for each practised bucket of the practice rhythm chart, a card with its label, total time, number of sessions, average time per session and the percentage it represents of the best day, week or month in the selected period.

#### Scenario: Hovering a practised bucket
- **WHEN** the user points at a bucket that has practice
- **THEN** the card shows the bucket label, its total time, its session count, the average time per session and its percentage of the best bucket in the period

#### Scenario: Keyboard focus
- **WHEN** the user focuses a practised bucket with the keyboard
- **THEN** the same detailed card appears

#### Scenario: Best bucket of the period
- **WHEN** the bucket is the one with the most practice in the selected period
- **THEN** the comparison reads as 100 % of the best day, week or month according to the selected period

#### Scenario: Bucket without practice
- **WHEN** the user points at a bucket without practice
- **THEN** no card is shown

#### Scenario: Changing the period
- **WHEN** the user switches between week, month and year
- **THEN** the card's best-unit comparison uses the matching day, week or month wording

### Requirement: The day summary names a practice once

The system SHALL show the name of a session in the calendar's day summary and SHALL omit the block line when the session has exactly one block whose name matches the session name, so a practice started from a single repertoire song is not listed twice.

#### Scenario: A practice started from one song
- **WHEN** a day holds a quick practice whose session name and only block share the song title
- **THEN** the summary shows the song title once, next to its time and BPM

#### Scenario: One block with another name
- **WHEN** a session has one block whose name differs from the session name
- **THEN** the summary shows the session name and the block name

#### Scenario: Several blocks
- **WHEN** a session has several blocks
- **THEN** the summary lists each block, even if one matches the session name

#### Scenario: Existing sessions
- **WHEN** the summary renders a session saved before this rule
- **THEN** the duplicate is hidden by the same rule without rewriting the stored session

### Requirement: The annual calendar's day summary can be opened with a tap

On a coarse pointer, the system SHALL open a day's summary on the first tap without navigating, SHALL open the day detail on a second tap on that same day, and SHALL move the summary when another day is tapped. Keyboard and assistive-technology activation SHALL open the day detail directly, and the pointer behaviour SHALL stay as it is.

#### Scenario: First tap on a day
- **WHEN** the user taps a day with saved practice on a touch screen
- **THEN** that day's summary opens and the page does not navigate

#### Scenario: Second tap on the open day
- **WHEN** the summary is open for a day and the user taps that same day again
- **THEN** the system opens that day's detail

#### Scenario: Tapping another day
- **WHEN** a summary is open and the user taps a different day
- **THEN** the summary moves to the new day without navigating

#### Scenario: Tapping a day without practice
- **WHEN** the user taps a day without saved practice
- **THEN** the summary shows that day's empty state and the page does not navigate

#### Scenario: Keyboard or assistive activation
- **WHEN** a day is activated from the keyboard or by an assistive technology
- **THEN** the day detail opens directly, without the extra tap

#### Scenario: Mouse keeps its behaviour
- **WHEN** the pointer hovers a day and then clicks it
- **THEN** the summary opens on hover and the click opens the day detail, as before

### Requirement: The annual calendar previews a day in a non-blocking card

The system SHALL show the annual calendar's day summary in a floating card next to the day under the pointer or keyboard focus, SHALL let pointer events pass through the card so the day underneath it stays hoverable and clickable, and SHALL keep the preview compact: date, session count, total time and up to three sessions, with a count of the sessions that do not fit.

#### Scenario: Opening a day
- **WHEN** the pointer enters a day of the annual calendar
- **THEN** its summary card opens next to that day without waiting for a dwell

#### Scenario: Moving across the card
- **WHEN** the pointer leaves the day and crosses the area occupied by the card
- **THEN** the day underneath the pointer receives the hover and the card updates to that day instead of keeping the previous one

#### Scenario: Choosing a day under the card
- **WHEN** the pointer clicks a day whose cell is covered by the open card
- **THEN** that day's detail opens normally

#### Scenario: Keyboard focus
- **WHEN** a day receives keyboard focus
- **THEN** the card opens next to it and describes that day until the focus moves

#### Scenario: Many sessions in a day
- **WHEN** the day has more than three sessions
- **THEN** the card lists the first three and shows how many more sessions that day has

#### Scenario: A day without practice
- **WHEN** the pointer or focus reaches a day without saved practice
- **THEN** the card shows that day's empty state and still lets the surrounding days be used

### Requirement: The annual preview closes when the day is no longer consulted

The system SHALL close the annual calendar's preview card after the pointer leaves the calendar, when the page scrolls, when the viewport is resized, when Escape is pressed, or when a touch user taps outside the calendar, and SHALL keep the touch two-tap rule: the first tap previews a day, the second tap on the same day opens its detail.

#### Scenario: Leaving the calendar
- **WHEN** the pointer leaves the day and the calendar without entering another day
- **THEN** the card closes after a short grace period

#### Scenario: Scrolling the page
- **WHEN** the page or the calendar strip scrolls while the card is open
- **THEN** the card closes instead of staying pinned to the old position

#### Scenario: Resizing or Escape
- **WHEN** the viewport is resized or the user presses Escape
- **THEN** the card closes

#### Scenario: First touch
- **WHEN** the user taps a day with practice on a touch screen
- **THEN** the card previews that day without navigating

#### Scenario: Second touch
- **WHEN** the user taps the same day again while its card is open
- **THEN** that day's detail opens

#### Scenario: Tapping outside
- **WHEN** the user taps outside the calendar while a preview is open
- **THEN** the card closes and the armed day is cleared
