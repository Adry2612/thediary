# Spec Delta

## ADDED Requirements

### Requirement: Material and reference video share the lick page

The system SHALL show a lick's study material and its YouTube reference clip side by side when both exist, SHALL give the material the primary and larger column with the video as the secondary column, and SHALL stack them with the material first on narrow viewports. When only one of the two exists, the system SHALL keep a single-section layout without an empty column.

#### Scenario: Both blocks on a wide viewport
- **WHEN** a lick has at least one study material and a reference video and the viewport is wide
- **THEN** the page shows the material in the larger left column and the video in the narrower right column

#### Scenario: The video aligns with the material viewer
- **WHEN** a lick has both blocks and the viewport is wide
- **THEN** the top of the video card aligns with the top of the material preview, not with the material heading

#### Scenario: Both blocks on a narrow viewport
- **WHEN** a lick has both blocks and the viewport is narrow
- **THEN** the page stacks them with the material above the video

#### Scenario: Only material
- **WHEN** a lick has study material but no reference video
- **THEN** the material uses the full content width and no empty video column is shown

#### Scenario: Only video
- **WHEN** a lick has a reference video but no study material
- **THEN** the video uses the single-section layout and no empty material column is shown

#### Scenario: Reading order follows material priority
- **WHEN** assistive technology reads the page with both blocks
- **THEN** it reaches the material section before the video section

#### Scenario: The material viewer keeps a usable width
- **WHEN** the material sits in the primary column
- **THEN** its resource selector is shown above the preview instead of in a wide sidebar, and choosing another resource updates the preview
