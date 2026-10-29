# Spec Delta

## ADDED Requirements

### Requirement: A string set can show its packaging image

The system SHALL let each catalogue set reference an optional packaging image, SHALL show it as a thumbnail in the set picker, in the string-change history and in the strings row, and SHALL show a neutral placeholder when the image is missing or cannot be loaded.

#### Scenario: Choosing a set
- **WHEN** the user opens the set picker
- **THEN** each set with an image shows its thumbnail next to the brand and model

#### Scenario: Reading the history
- **WHEN** the user opens the history of a guitar
- **THEN** each string change shows the thumbnail of the mounted set

#### Scenario: The strings row
- **WHEN** a guitar has a string change with an image
- **THEN** the row shows a small thumbnail of that set

#### Scenario: No image
- **WHEN** a set has no image, or its file cannot be loaded
- **THEN** the placeholder keeps the same box and the layout does not move

#### Scenario: A decorative image
- **WHEN** a screen reader reaches a set with an image
- **THEN** the image is not announced twice, because the brand and model already name the set

### Requirement: Packaging images ship with the catalogue

Every set in the catalogue SHALL ship its packaging image under `public/string-sets/`, and the system SHALL keep working with the placeholder when a file is missing or cannot be loaded.

#### Scenario: A fresh checkout
- **WHEN** the app is built from the repository
- **THEN** every set shows the thumbnail of its own packaging

#### Scenario: A retired set
- **WHEN** the user deletes one photo without touching the code
- **THEN** that set falls back to the placeholder and nothing else changes

#### Scenario: A missing file
- **WHEN** a set points at a file that is not there
- **THEN** the placeholder appears instead of a broken image
