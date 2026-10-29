# Spec Delta

## REMOVED Requirements

### Requirement: Focusing a control does not zoom the page

**Reason**: The product now forbids zoom on every interaction inside the app, not only the automatic zoom that a focused control could trigger. Keeping pinch zoom available contradicts that decision.

**Migration**: No stored data or user action changes. The new "The page never zooms on interaction" requirement keeps the 16 px minimum for text controls and replaces the pinch-zoom allowance with a fixed-scale viewport.

## ADDED Requirements

### Requirement: The page never zooms on interaction

The system SHALL declare a viewport without user scaling, SHALL render text inputs, text areas and search fields at 16 px or more at every breakpoint, and SHALL prevent the double-tap zoom on controls, so focusing a control, tapping once or tapping twice never changes the page scale.

#### Scenario: Signing in on a phone
- **WHEN** the user focuses the email or password field after opening the account screen
- **THEN** the page keeps its zoom level and only the keyboard opens

#### Scenario: Searching on a phone
- **WHEN** the user focuses any search field
- **THEN** the page keeps its zoom level

#### Scenario: A wide phone or a small tablet
- **WHEN** the user focuses a text control while the viewport is wider than the phone breakpoint
- **THEN** the control still uses at least 16 px and the page does not zoom

#### Scenario: Tapping twice on a control
- **WHEN** the user taps the same button or link twice in quick succession
- **THEN** the page does not zoom in

#### Scenario: Pinching the screen
- **WHEN** the user pinches the screen in a browser that honours the declared viewport scale
- **THEN** the app does not scale and the content stays at its normal size
