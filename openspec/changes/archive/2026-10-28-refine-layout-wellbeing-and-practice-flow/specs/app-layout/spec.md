# Spec Delta

## ADDED Requirements

### Requirement: The navigation bar widens on ultrawide screens

The system SHALL keep every screen's content column capped at its current maximum width on ultrawide viewports, SHALL let the header and its navigation use a wider capped column than the content, and SHALL stop that wider column before it reaches the viewport edges.

#### Scenario: An ultrawide viewport
- **WHEN** the app is shown on a monitor wide enough that the content column has stopped growing
- **THEN** the header and its navigation are wider than the content column and stay centred, with visible space left at both viewport edges

#### Scenario: The navigation column stops growing
- **WHEN** the viewport keeps widening after the navigation reaches its own maximum width
- **THEN** the navigation stops growing and does not spread to the viewport edges

#### Scenario: Below the ultrawide breakpoint
- **WHEN** the app is shown at a width where the content column has not reached its cap
- **THEN** the header and the content keep the same side gutters and stay aligned as before

#### Scenario: A phone or tablet
- **WHEN** the app is shown on a phone or tablet
- **THEN** the header keeps its current width and gutters without a new overflow or horizontal scroll

#### Scenario: Moving between screens
- **WHEN** the user navigates between screens on an ultrawide viewport
- **THEN** the navigation keeps the same widened column and does not jump between screens
