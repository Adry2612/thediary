# Spec Delta

## ADDED Requirements

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
