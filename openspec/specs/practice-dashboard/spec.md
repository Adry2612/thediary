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

The system SHALL show the most practised song, technique and theory topic of a rolling window chosen by the ranking section itself, SHALL offer week, 30 days and year for that window, SHALL default to 30 days, SHALL group technique and theory by block name, SHALL show each entry's practised time and session count, SHALL count songs linked to the repertoire and catalog songs not yet added to it, and SHALL show an empty state for a ranking with no data in that window.

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

#### Scenario: Changing the ranking period
- **WHEN** the user changes the period of the ranking section
- **THEN** the rankings are recalculated for that window and the rhythm chart keeps its own period

#### Scenario: Default period
- **WHEN** the dashboard opens
- **THEN** the rankings cover the thirty days ending today

#### Scenario: Independent from the rhythm chart
- **WHEN** the user changes the rhythm chart period
- **THEN** the rankings keep their own period and do not change

#### Scenario: Accessible period control
- **WHEN** assistive technology reaches the ranking period control
- **THEN** it finds a named group whose buttons expose which period is selected

#### Scenario: A catalog song
- **WHEN** a practised block references a catalog song that is not in the repertoire yet
- **THEN** the song appears in the song ranking with its catalog title and practised time

#### Scenario: No data for a ranking
- **WHEN** the selected period has no song, technique or theory practice
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

The system SHALL show, for each practised bucket of the practice rhythm chart, a card with its label, total time, number of sessions, average time per session and, when it is not the best bucket, how far short it falls of the best day, week or month in the selected period. When the bucket is the current month in the year period and is below the best month, the card SHALL instead say what percentage is left to beat the best month.

#### Scenario: Hovering a practised bucket
- **WHEN** the user points at a bucket that has practice
- **THEN** the card shows the bucket label, its total time, its session count, the average time per session and how far short it falls of the best bucket, or that it is the best bucket

#### Scenario: Keyboard focus
- **WHEN** the user focuses a practised bucket with the keyboard
- **THEN** the same detailed card appears

#### Scenario: Best bucket of the period
- **WHEN** the bucket is the one with the most practice in the selected period
- **THEN** the comparison names it as the best day, week or month instead of showing a percentage

#### Scenario: A bucket below the best
- **WHEN** the bucket has less practice than the best one
- **THEN** the comparison says how far short it fell, as a percentage when the gap is under an hour and as a duration when it is an hour or more

#### Scenario: The current month is still below the best month
- **WHEN** the year period is shown, the bucket is the current month and another month has more practice
- **THEN** the card says the percentage left to beat the best month instead of how far short it fell

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


### Requirement: The annual calendar previews a day with its full content

The system SHALL show the annual calendar's day summary in a floating card next to the day under the pointer or keyboard focus, SHALL let the pointer enter the card and scroll its session list, and SHALL show the full content of the day: date, session count, total time and every session with its name, time, BPM, practised blocks and notes.

#### Scenario: Opening a day
- **WHEN** the pointer enters a day of the annual calendar
- **THEN** its summary card opens next to that day without waiting for a dwell

#### Scenario: Entering the card
- **WHEN** the pointer leaves the day and enters the open card
- **THEN** the card stays open and its session list can be scrolled

#### Scenario: Scrolling the card
- **WHEN** the day has more content than fits in the card and the user scrolls inside it
- **THEN** the card stays open and shows the rest of the sessions, blocks and notes

#### Scenario: Keyboard focus
- **WHEN** a day receives keyboard focus
- **THEN** the card opens next to it and describes that day until the focus moves

#### Scenario: Many sessions in a day
- **WHEN** the day has several sessions
- **THEN** the card lists every session with its practised blocks and notes, without a "more sessions" summary

#### Scenario: A block that was not practised
- **WHEN** a session includes a block with zero practised time
- **THEN** the card omits that block and its notes from the day summary

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

### Requirement: Each balance card has its own period selector

The system SHALL show a period selector with the options week, 30 days and year on the skill balance card and on the guitar balance card, SHALL let each card choose its own period, SHALL default both to 30 days, and SHALL recompute only the balance of the card whose period changed.

#### Scenario: Default period
- **WHEN** the dashboard opens
- **THEN** both balance cards show the 30-day period selected

#### Scenario: Changing the skill period
- **WHEN** the user selects year on the skill balance card
- **THEN** the skill balance switches to the year window and the guitar balance keeps its own period and selection

#### Scenario: Changing the guitar period
- **WHEN** the user selects week on the guitar balance card
- **THEN** the guitar balance switches to the week window and the skill balance keeps its own period and selection

#### Scenario: Accessible name and state
- **WHEN** assistive technology reaches the selector
- **THEN** it finds a named group that names its own balance and whose buttons expose which period is selected

#### Scenario: Narrow viewport
- **WHEN** the dashboard is shown on a phone
- **THEN** the selector wraps inside its card without horizontal overflow and every option stays reachable

#### Scenario: Empty period
- **WHEN** a balance's selected period has no classified practice
- **THEN** that card keeps its layout and shows its empty state for that period

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


### Requirement: The evolution charts animate on appearance and change

The system SHALL animate the practice rhythm bars, the skill-balance bars and ring, the guitar balance arc, the monthly heatmap and the annual calendar on first appearance or a period, month or year change, using only opacity, transform or SVG stroke drawing so no layout shifts, and SHALL finish within 500 ms. Bar and cell staggers SHALL start within 250 ms. The ring and the arc SHALL draw as one continuous sweep without background gaps between sections.

#### Scenario: The ring draws without gaps
- **WHEN** the skill ring or the guitar arc animates
- **THEN** it draws as one continuous sweep and no background gap appears between its sections

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
