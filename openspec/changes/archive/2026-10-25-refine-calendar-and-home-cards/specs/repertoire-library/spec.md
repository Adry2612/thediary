# Spec Delta

## ADDED Requirements

### Requirement: The home screen previews recent songs as cards

The system SHALL show up to four recently updated songs on the home screen as cards, each with its artwork or the neutral placeholder, its title, its artist and album/year when known, its learned-parts progress, and a link to the song's detail. The section SHALL keep its existing loading and empty states.

#### Scenario: A song with artwork
- **WHEN** a recent song has artwork
- **THEN** its card shows the cover next to the title and progress

#### Scenario: A song without artwork
- **WHEN** a recent song has no artwork or the image cannot load
- **THEN** the neutral placeholder occupies the same space and the rest of the card looks unchanged

#### Scenario: Showing progress
- **WHEN** a song has parts
- **THEN** its card shows how many parts are learned out of the total and a progress bar with the same value

#### Scenario: A song without parts
- **WHEN** a song has no parts yet
- **THEN** its card shows the no-parts message instead of an empty progress bar

#### Scenario: Album and year
- **WHEN** a song stores an album or a release year
- **THEN** the card shows that information with the artist, and omits whatever is not stored

#### Scenario: Opening a card
- **WHEN** the user activates a song card
- **THEN** the song's detail opens

#### Scenario: No recent songs
- **WHEN** the repertoire has no songs
- **THEN** the section keeps its existing empty state and its link to the repertoire

#### Scenario: Long text
- **WHEN** a title or artist is longer than the card
- **THEN** the text wraps inside the card without overflowing it

#### Scenario: Narrow viewport
- **WHEN** the home screen is shown on a narrow viewport
- **THEN** the cards keep a readable grid inside the viewport without horizontal scrolling
