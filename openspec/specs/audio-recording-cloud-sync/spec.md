# audio-recording-cloud-sync Specification

## Purpose
Permite que el usuario conserve y recupere sus grabaciones de audio entre dispositivos mediante Google Drive o OneDrive, sin sustituir el almacenamiento local ni exigir una cuenta externa cuando no desea sincronizar.

## Requirements

### Requirement: Local recording storage remains the default

The system SHALL continue saving new audio recordings locally when the user has not connected a supported external storage provider, and SHALL keep local playback and deletion available independently of external synchronization.

#### Scenario: Guest saves a recording without a provider
- **WHEN** a user finishes an audio recording without an external provider connection
- **THEN** the recording is saved locally and can be played and deleted from the app

#### Scenario: External synchronization fails after local save
- **WHEN** a recording is saved locally and its external upload fails
- **THEN** the local recording remains available and the app reports that external synchronization requires a retry

### Requirement: User can connect a supported storage provider voluntarily

The system SHALL let the user connect or disconnect Google Drive or OneDrive through an explicit authorization flow, and SHALL NOT initiate provider authentication without the user's action. The system SHALL NOT upload recordings without a user action unless the user has explicitly enabled automatic synchronization, and even then it SHALL only upload through providers the user has already connected.

#### Scenario: User connects Google Drive
- **WHEN** the user selects Google Drive and completes authorization
- **THEN** the app records that Google Drive is available for synchronization and does not expose the provider access token in the client UI or recording metadata

#### Scenario: User connects OneDrive
- **WHEN** the user selects OneDrive and completes authorization
- **THEN** the app records that OneDrive is available for synchronization and does not expose the provider access token in the client UI or recording metadata

#### Scenario: User disconnects a provider
- **WHEN** the user disconnects a connected provider
- **THEN** the app stops initiating uploads through that provider, retains local recordings, and explains whether existing remote files remain untouched

#### Scenario: Automatic synchronization is disabled
- **WHEN** the user has not enabled automatic synchronization
- **THEN** the app does not upload any recording unless the user requests it from that recording's synchronization menu

#### Scenario: User has not authorized a provider
- **WHEN** the app starts with automatic synchronization enabled but no connected provider
- **THEN** the app does not start an authorization flow on its own and only offers the connection through the existing account/settings actions

### Requirement: Opt-in automatic synchronization on app start

The system SHALL provide a setting that enables automatic synchronization of recordings when the app starts, SHALL keep that setting disabled by default, and SHALL treat the enabled setting as the user's explicit consent to upload recordings through providers that are already connected.

#### Scenario: Automatic synchronization is enabled with a connected provider
- **WHEN** automatic synchronization is enabled, a provider is connected, and the app starts
- **THEN** the app uploads the locally available recordings that are not yet present in that provider without requiring a per-recording action

#### Scenario: Recordings already present in the provider
- **WHEN** the app starts with automatic synchronization enabled and a recording already exists in the connected provider
- **THEN** the app does not upload that recording again and does not create a duplicate remote file

#### Scenario: Provider is unreachable during automatic synchronization
- **WHEN** the automatic synchronization cannot reach or authorize the connected provider
- **THEN** every recording remains available locally, the app presents a non-blocking notice with an actionable message, and the user can retry

#### Scenario: Recording without readable local audio
- **WHEN** the automatic synchronization encounters a recording whose local audio is unavailable or empty
- **THEN** the app skips that recording without creating an empty remote file and continues with the remaining recordings

### Requirement: Each recording exposes synchronization options

The system SHALL show a synchronization control for each recording that opens a menu with the supported providers and the current synchronization state.

#### Scenario: User opens recording synchronization options
- **WHEN** the user activates the synchronization control for a recording
- **THEN** the app opens a menu offering Google Drive and OneDrive, indicating which provider is connected and the recording's current state for each available provider

#### Scenario: No provider is connected
- **WHEN** the user opens synchronization options without a connected provider
- **THEN** the app offers to open provider connection settings and does not start an upload

### Requirement: User can synchronize an individual recording

The system SHALL allow the user to request synchronization of an individual recording to a connected provider and SHALL associate the remote copy with the recording so repeated requests do not create duplicate app-managed files.

#### Scenario: Recording uploads successfully
- **WHEN** the user selects a connected provider for a locally available recording
- **THEN** the app uploads the audio, marks the recording as synchronized for that provider, and presents the remote synchronization state without interrupting local playback

#### Scenario: User retries a failed upload
- **WHEN** a previous upload for a recording failed and the user selects the provider again
- **THEN** the app retries the upload and replaces the failed state with synchronized or a new actionable error

#### Scenario: Recording is unavailable locally
- **WHEN** the user requests synchronization for a recording that has no readable local audio file
- **THEN** the app does not create an empty remote file and reports that the recording cannot be synchronized until its audio is available

### Requirement: Synchronized recordings are available across authorized devices

The system SHALL recognize app-managed recordings already synchronized to the same provider when the user authorizes that provider on another device, and SHALL preserve recording metadata needed for listing and playback.

#### Scenario: User opens the app on a second device
- **WHEN** the user authorizes the same provider account on another device
- **THEN** the app discovers the app-managed synchronized recordings and makes their metadata and playback available without requiring the original device

#### Scenario: Playback of a recording that only exists in the provider
- **WHEN** the app lists a recording that is present in the provider but not on the device and the user starts its playback
- **THEN** the app serves the audio through its own endpoint so the provider access token stays on the server, and supports seeking within the audio

#### Scenario: Provider cannot be reached
- **WHEN** the app cannot access a connected provider while loading recordings
- **THEN** locally available recordings remain usable and the app identifies the remote catalog as unavailable instead of deleting local or previously known recordings

### Requirement: Provider scope is limited to the supported release

The system SHALL offer only Google Drive and OneDrive as external recording providers in this change, and SHALL not present iCloud Drive as an available synchronization option.

#### Scenario: User views provider choices
- **WHEN** the user opens provider settings or a recording synchronization menu
- **THEN** Google Drive and OneDrive are shown as supported choices and iCloud Drive is not shown as an enabled choice
