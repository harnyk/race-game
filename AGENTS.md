# 🧐 AGENTS.md — Coding Agents Developer Guide for The Drift

This file serves as a **knowledge base and coordination map** for Codex agents working on *The Drift*.
It documents responsibilities of key modules and enforces consistency in developer operations.

---

## 📁 Project Structure & Responsibilities

### Core Engine — `src/engine/`

#### `Context.ts`

Memory pooling for `Vec2D`, `Matrix3`, etc. Used to minimize allocation overhead.

#### `FixedTimestepIntegrator.ts`

Runs game logic at fixed intervals (e.g. 60fps), regardless of rendering framerate.

#### `Viewport.ts`

Camera system. Translates between world and screen coordinates. Handles zoom, pan, and rotation.

#### `World.ts`

Contains and renders all `Renderable` objects. Central rendering loop iterates over them.

#### `WorldRenderer.ts`

Wraps canvas context and renders a `World`.

#### `Matrix3.ts`

3x3 transformation matrix with rotation, scale, translation, and inversion support.

#### `Vec2D.ts`, `IVec2D.ts`

2D vector math. `Vec2D` is mutable, `IVec2D` is interface.

---

### Physics — `src/engine/physics/`

#### `RigidBody2D.ts`

Handles mass, velocity, force, angular motion. Central to all physical entities.

#### `CollisionBody.ts` (abstract)

Base class for collision detection with SAT. Implemented by:

* `BoxCollisionBody.ts` — axis-aligned rectangles
* `RegularPolygonCollisionBody.ts` — n-gon shapes like the Terrorist

#### `CollisionDetector.ts`

Performs pairwise collision detection with SAT and triggers collision events.
Maintains contact state between frames.

---

### Math Support — `src/engine/vec/`

* `Vec2D.ts` — main vector class.
* `Vec2DAverager.ts` — running average of vectors (used for center of mass).
* `fromDeg.ts` — converts degrees to radians.

---

### Game Layer — `src/game/`

#### `Game.ts`

Main game loop. Initializes objects, integrates physics, handles collisions, rendering and game state.
**ENTRY POINT** for Codex understanding the system.
Provides `resize(width, height)` to adjust canvas and viewport when the browser window size changes.
Exposes `pause()`, `resume()` and `togglePause()` to control the simulation loop.

#### `Block.ts`

Field squares (green = good, red = bad). Each is a renderable + static collider.
Can be inverted by the Terrorist.

#### `Car.ts`

Player’s vehicle. Wraps `RigidBody2D` + `VehicleController`.

#### `Terrorist.ts`

Big enemy shape (a 5-gon). Follows the center of mass of all blocks using force.

---

### UI Elements — `src/game/renderables/`

* `CarRenderable.ts` — car drawing (blue rectangle + wheels)
* `RegularPolygonRenderable.ts` — draws Terrorist
* `TerroristEyesRenderable.ts` — draws "eyes" of the Terrorist
* `CompassRenderable.ts` — HUD compass for player orientation
* `SpeedometerRenderable.ts` — HUD speed display
* `TerroristIndicatorRenderable.ts` — HUD pointer towards Terrorist
* `CurvedGrid.ts` — warped background grid based on gravity well
* `GameStateOverlayRenderable.ts` — displays "VICTORY" or "GAME OVER" text

---

### Input — `src/game/controls/`

* `KeyboardControl.ts` — emits directional events from WASD or Arrow keys.
* `Events.ts` — defines the shape of input events.

---

### Entry Point

#### `src/main.tsx`

Bootstraps React application. Renders `App` which includes the game canvas.

```tsx
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

#### `src/GameCanvas.tsx`

React component that creates the `Game` once and attaches it to a `<canvas>`
element. Uses `useEffect` with an empty dependency list so the game is not
restarted on prop changes. Handles window resizing and updates the game's
viewport via `Game.resize()`. Accepts a `paused` prop to pause or resume the
game instance.

#### `src/LayeredLayout.tsx`

Generic full-screen layout that stacks an array of layers. Each layer is
absolutely positioned. Includes a small "created by TheDrift team" label in
the bottom-right corner.

#### `src/UiOverlay.tsx`

Transparent overlay used for React interface elements. Currently only displays
a small debug label in the bottom-right corner.

#### `src/PauseMenu.tsx`

Pause menu overlay with "Menu" and "The Drift" titles. Renders a list of
options via `MenuOption`. Supports keyboard navigation with arrow keys and
selection with Enter or the mouse. Accepts an `onExit` callback to resume the
game.

#### `src/MenuOption.tsx`

Reusable button component for menu entries. Exports `MenuOptionProps` and the
default `MenuOption` React component.

#### `src/App.tsx`

Root React component. Renders `LayeredLayout` which hosts the game and UI
layers. Handles `Escape` key to toggle the `PauseMenu` layer and passes the
pause state to `GameCanvas`.

---

### Tests

* Physics: `src/engine/physics/__tests__/CollisionDetector.test.ts`
* World logic: `src/engine/__tests__/World.test.ts`

---

### Tooling & Scripts

* `npm run dev` — launch dev server
* `npm test` — run Jest tests
* `npm run typecheck` — run `tsc --noEmit`

---

## 💪 Allocation Policy & Memory Pools

**The Drift** runs a high-frequency physics simulation and real-time rendering loop.
To avoid excessive **garbage collection pauses**, all **Vec2D** and **Matrix3** allocations are **pooled** via `Context`.

#### ❗️RULE: Never `new Vec2D()` during game loop

Instead, use:

```ts
this.context.vectorPool.borrow((acquire) => {
    const force = acquire();
    force.assign(targetPosition);
    force.sub(body.position);
    force.normalize();
    force.scale(100); // apply scaled directional force
    body.applyForce(force);
});
```

The `borrow()` function:

* Acquires temporary objects for the scope of the callback
* Automatically resets and recycles them after use
* Prevents allocation churn inside inner loops

#### ✅ Good

```ts
this.context.vectorPool.borrow((acquire) => {
    const dir = acquire();
    dir.assign(target);
    dir.sub(origin);
    dir.normalize();
    body.applyForce(dir);
});
```

#### ❌ Bad

```ts
const dir = new Vec2D(); // NO: allocates on every frame
dir.assign(target);
dir.sub(origin);
```

This will cause GC pressure and performance spikes.

#### ✅ For reusable long-lived vectors

Declare once in class:

```ts
private readonly _tmp = new Vec2D();

someMethod() {
    this._tmp.assign(...);
    ...
}
```

Use this **only** when the vector is not shared and won't be accessed concurrently.

#### ❗️ Also Forbidden: Assigning vector objects directly

Never do this:

```ts
body1.position = body2.position; // BAD: now both point to the same object!
```

Instead, use:

```ts
body1.position.assign(body2.position); // GOOD: copies values safely
```

Direct assignment copies a reference, **not values**, leading to bugs where multiple objects share a single Vec2D instance.

---

## ⚠️ Codex Prompt — Maintain AGENTS.md

Whenever you change or add a file, or move logic between files, you **must** update this file accordingly.

After completing your change, ensure the following:

1. Describe the change in AGENTS.md under the appropriate path
2. If you created a new module, document its purpose and key exports
3. If you moved code, update the old and new paths

Use the format already present in AGENTS.md for consistency

---

## Notes

* Project uses **HTML5 Canvas**, **no React** in-game.
* TypeScript strict mode enabled.
* Tailwind used for UI layout.
* Game loop is decoupled from rendering loop via `FixedTimestepIntegrator`.

---

## Human Language Policy

* All branches names are written in English
* All code comments are written in English
* All commit messages are written in English
* All file names are written in English
* All variable names are written in English
* All function names are written in English
* All class names are written in English

---