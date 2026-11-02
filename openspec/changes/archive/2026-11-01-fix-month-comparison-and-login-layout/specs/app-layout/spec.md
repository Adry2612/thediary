# Spec Delta

## ADDED Requirements

### Requirement: A single-form screen is centred in the shared column

The system SHALL centre horizontally, inside the shared page column, the content of a screen whose only purpose is one form or one account panel, together with its page header, SHALL keep that content capped to a readable width, and SHALL use the same placement while the screen loads.

#### Scenario: Signing in on a wide viewport
- **WHEN** a signed-out user opens the account screen on a wide viewport
- **THEN** the header and the sign-in card are centred horizontally in the column instead of sitting against its left edge

#### Scenario: Account panel when signed in
- **WHEN** a signed-in user opens the account screen
- **THEN** the account panel uses the same centred placement as the sign-in card, so switching between signed-out and signed-in does not move it

#### Scenario: Narrow viewport
- **WHEN** the account screen is shown on a phone
- **THEN** the card fills the available width between the side gutters and does not overflow horizontally

#### Scenario: Loading state
- **WHEN** the account screen is still loading
- **THEN** its placeholder occupies the same centred position and width, so nothing moves when the content arrives

#### Scenario: Shared shell unchanged
- **WHEN** the user navigates between the account and any other screen
- **THEN** the page column, its side margins and the header position keep the shared values, and only the account content is centred inside it
