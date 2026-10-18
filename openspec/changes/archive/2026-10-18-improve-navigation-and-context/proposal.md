# Proposal

## Why

The app walks the user into nested views —a song's file from the repertoire, a practice day from the dashboard, the routine designer from the practice screen— and none of them says how to come back: the way back is plain text, styled like any other link, and the repertoire file does not even have one. The app name in the header, the most common "take me home" gesture of any app, is plain text that goes nowhere.

And while a song from the repertoire is being practiced, the block shows the song's name but not who it is by, so "Master of Puppets" and any other song look the same at a glance.

## What Changes

- Make the app name in the header a link to the start.
- Give the nested views a way back marked with a left arrow: the new repertoire item, the repertoire file, the practiced day, and the routine designer.
- Show the artist of the repertoire item under the song's name while a practice is running.

## Impact

- Affected specs: `app-navigation` (new) and `practice-session-management`.
- Affected code:
  - `src/components/ui/BackLink.tsx` (new: the way back with its arrow) and `src/components/ui/icons.tsx` (`ArrowLeftIcon`).
  - `src/components/layout/SiteNavigation.tsx` (the app name).
  - `src/app/(workspace)/repertoire/new/page.tsx`, `src/app/(workspace)/repertoire/[id]/page.tsx`, `src/components/dashboard/PracticeDayDetail.tsx` and `src/components/practice/PracticeWorkspace.tsx` (the ways back).
  - `src/components/practice/PracticeSession.tsx` and `src/components/practice/TimerCard.tsx` (the artist of the block being practiced).
- Out of scope: the history of the browser as the way back, breadcrumbs, and any artist entity or link — the artist stays the free-text field the item already has.
