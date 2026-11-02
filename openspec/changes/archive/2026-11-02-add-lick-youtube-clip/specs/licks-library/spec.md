# Spec Delta

## ADDED Requirements

### Requirement: A lick can carry a YouTube reference clip

The system SHALL let the user attach at most one YouTube video to a lick with a start and an end time, SHALL accept seconds, `m:ss` and `h:mm:ss`, SHALL require the end to be later than the start, SHALL keep the clip optional, and SHALL discard an invalid stored clip without discarding the lick.

#### Scenario: Saving a clip
- **WHEN** the user enters a YouTube link and the times 1:23 and 1:35 and saves the lick
- **THEN** the lick keeps that link with its start and end and shows them when it is reopened

#### Scenario: A clip is optional
- **WHEN** the user saves a lick without a YouTube link
- **THEN** the lick is saved without a reference clip and its page shows no player

#### Scenario: A link that is not a YouTube video
- **WHEN** the user enters a link that is not a YouTube video or leaves the times empty
- **THEN** the app rejects the clip with a message and does not save the lick

#### Scenario: The end is not after the start
- **WHEN** the user enters an end time equal to or earlier than the start
- **THEN** the app rejects the clip with a message and does not save the lick

#### Scenario: Removing the clip
- **WHEN** the user clears the YouTube link of a lick that had one and saves
- **THEN** the lick is saved without a reference clip

#### Scenario: A lick from before this feature
- **WHEN** the app loads a lick saved without a reference clip
- **THEN** the lick loads with all its other content and no clip

#### Scenario: A stored clip that is no longer valid
- **WHEN** a stored lick has a clip whose link is not a YouTube video or whose times do not fit
- **THEN** the app loads the lick without that clip and keeps the rest of its content

### Requirement: The reference clip plays only its fragment in a loop

The system SHALL embed the reference clip on the lick's page, SHALL start playback at the marked start, SHALL return to the start when the marked end is reached and repeat the fragment, and SHALL offer a link that opens YouTube at the start.

#### Scenario: Opening a lick with a clip
- **WHEN** the user opens the page of a lick that has a reference clip
- **THEN** the page shows the video with a line naming its start and end

#### Scenario: Repeating the fragment
- **WHEN** the video reaches the marked end during playback
- **THEN** it goes back to the marked start and keeps playing from there

#### Scenario: Opening the fragment on YouTube
- **WHEN** the user activates the link that opens YouTube
- **THEN** YouTube opens the same video at the marked start

#### Scenario: Changing the clip
- **WHEN** the user edits the link or the times of a lick and saves
- **THEN** the page shows the video with the new fragment and the loop uses it
