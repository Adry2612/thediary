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
