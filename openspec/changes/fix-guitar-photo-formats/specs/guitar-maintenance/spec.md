# Spec Delta

## ADDED Requirements

### Requirement: Guitar photos accept what phones produce

The system SHALL accept JPG, PNG, WebP, AVIF, GIF, HEIC and HEIF images for the guitar photo, SHALL reject a file it cannot decode at the moment it is chosen, and SHALL say which formats it accepts.

#### Scenario: A photo from an iPhone
- **WHEN** the user chooses a HEIC photo in a browser that can read it
- **THEN** the photo is accepted, reduced and shown before saving

#### Scenario: A format the browser cannot read
- **WHEN** the user chooses an image whose format the browser cannot decode
- **THEN** the form says so at once and no photo is saved

#### Scenario: An unsupported file
- **WHEN** the user chooses a PDF or another non-image file
- **THEN** the form lists the accepted image formats

#### Scenario: Too large
- **WHEN** the image exceeds the size limit
- **THEN** the form says it is too large and keeps the rest of the form as it was
