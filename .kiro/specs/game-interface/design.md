# Design — Game Interface

## Structure

```
src/app/App.tsx            screen switch (landing | world)
src/app/store.ts           session store: screen, mode, themeId (graph + selection stores added later)
src/ui/landing/            Landing, world cards, Create World panel
src/ui/world/              WorldShell (HUD frame), canvas mount
src/ui/legend/             Legend tree (category -> type -> instance)
src/ui/inspector/          hover label, inspector card
src/ui/import/             ImportDialog (sample | upload | paste), PlanPreview
```

## State

- `useSession`: screen, mode, themeId.
- `useWorld` (Task 2+): graph, import status. Replaced only on confirmed import.
- `useSelection` (Task 3+): selectedId, hoveredId, highlightedType. Derived highlight sets are memoized selectors over precomputed graph indexes.

The canvas and DOM read the same stores, so legend clicks and world clicks stay in sync.

## Visual language

Dark translucent panels with blur, rounded corners, display font for headings, theme accent colour
on active states. HUD sits on top of the full-bleed canvas. The legend is a left drawer that collapses
to an icon rail; the inspector is a right card.

## Testing

Component tests (Testing Library) for navigation, legend tree, import dialog. Playwright journeys for
landing -> world -> legend -> inspector -> theme switch -> menu. Screenshots at 1440x900 and 390x844.
