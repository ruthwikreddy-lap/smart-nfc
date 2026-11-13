# Smart NFC platform redesign

## Goal
Redesign the existing Smart NFC application as one polished, responsive product, retaining its current account system, generated profile URLs, emergency cards, image uploads, and other working capabilities.

## Work
1. Refresh the shared visual system around the selected near-black and #007BFF palette: semantic color tokens, restrained borders, accessible focus/hover states, consistent typography, and compact surfaces.
2. Rework the home and sign-in/sign-up experience without removing the current professional/emergency account choices or existing auth behavior.
3. Create a cohesive signed-in dashboard shell with a collapsible desktop sidebar and usable mobile navigation. Organize existing destinations into overview, profile management, insights, account, and help areas; remove or clearly label destinations that do not yet have real functionality.
4. Improve the profile editor and preview, preserving each account's current public URL on edits and enforcing the existing one-profile-per-account limit. Keep image upload, theme choice, social/contact actions, sharing, and emergency-card creation available.
5. Refresh public profile and emergency-card views for mobile-first viewing, accessibility, and direct-link access across devices. Retain published routes and show real loading, empty, and error states.
6. Make overview/analytics reflect only collected information; use clear empty states where visitor or click tracking does not exist. Organize account/settings controls into focused sections without inventing integrations.
7. Inspect the live cloud schema and policies before applying any required additive database changes. Preserve current data and URLs, add explicit grants and narrowly scoped policies, and add database uniqueness for one profile page per account after checking existing records for conflicts.
8. Verify key routes and interactions at mobile and desktop sizes, run available relevant tests, and resolve preview build errors.

## Technical approach
- Keep the current React, Vite, TypeScript, Tailwind, shadcn, and Lovable Cloud setup; reuse existing components and routes where practical.
- Maintain public read access only for public profile/card content and restrict account changes to their owner; do not add fake analytics or client-side admin authorization.
- Record any new structural decision in the root `AGENTS.md` and track the multi-part work in `roadmap.md` during implementation.
