# Spec Delta

## Purpose

Defines how overlays enter and leave the screen: a short, shared transition for dialogs, confirmations and sheets that makes an overlay feel attached to the action that opened it, while never delaying the interaction and disappearing entirely for users who ask for reduced motion.

## ADDED Requirements

### Requirement: Overlays enter and leave with a short transition

The system SHALL animate every modal overlay —dialogs, confirmations, completion sheets and pickers— as a brief fade of the backdrop together with a small rise and scale of the panel, SHALL keep the exit shorter than the entrance, SHALL keep the overlay non-interactive while it leaves, and SHALL skip the transition when the user prefers reduced motion.

#### Scenario: Opening a dialog
- **WHEN** the user opens any dialog
- **THEN** the backdrop fades in and the panel appears with a minimal rise, in under a fifth of a second

#### Scenario: Closing a dialog
- **WHEN** the user closes the dialog with its button, Escape or the backdrop
- **THEN** the panel and backdrop leave with the same motion reversed and the controls cannot be activated while leaving

#### Scenario: Reduced motion
- **WHEN** the user has reduced motion enabled
- **THEN** the dialog appears and disappears without any transition

#### Scenario: Focus while opening
- **WHEN** a dialog opens
- **THEN** the initial focus and the Escape key behave as before, without waiting for the animation to finish
