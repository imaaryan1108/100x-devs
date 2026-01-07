# Recoil State Management – Detailed README

## Overview

Recoil is a state management library for React developed by Facebook.  
It provides fine‑grained control over global and derived state using atoms and selectors, while integrating naturally with React hooks and Suspense.

Recoil solves common problems such as:
- Prop drilling
- Unnecessary re-renders
- Managing derived/computed state
- Handling async server state

---

## Installation

```bash
npm install recoil
# or
yarn add recoil
```

---

## Basic Setup

Wrap your application with `RecoilRoot`.

```tsx
import { RecoilRoot } from "recoil";

function App() {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  );
}
```

All atoms and selectors must be used within a `RecoilRoot`.

---

## Core Concepts

| Concept | Description |
|------|------------|
| RecoilRoot | Provider for Recoil state |
| Atom | Smallest unit of state |
| Selector | Derived or computed state |
| AtomFamily | Parameterized atoms |
| SelectorFamily | Parameterized selectors |
| Async Selectors | Server/async state |
| Effects | Side effects on atom lifecycle |

---

## Atoms

Atoms represent a piece of state.

```ts
import { atom } from "recoil";

export const countAtom = atom<number>({
  key: "countAtom",
  default: 0,
});
```

Rules:
- Keys must be globally unique
- Atoms can store primitives or objects
- Components re-render only when atoms they use change

---

## Using Atoms

### Read & Write

```tsx
import { useRecoilState } from "recoil";

const Counter = () => {
  const [count, setCount] = useRecoilState(countAtom);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};
```

### Read Only

```tsx
import { useRecoilValue } from "recoil";

const Display = () => {
  const count = useRecoilValue(countAtom);
  return <p>{count}</p>;
};
```

### Write Only

```tsx
import { useSetRecoilState } from "recoil";

const Increment = () => {
  const setCount = useSetRecoilState(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>+</button>;
};
```

---

## Selectors (Derived State)

Selectors compute values from atoms or other selectors.

```ts
import { selector } from "recoil";

export const doubleCountSelector = selector<number>({
  key: "doubleCountSelector",
  get: ({ get }) => {
    const count = get(countAtom);
    return count * 2;
  },
});
```

Selectors are:
- Cached
- Pure
- Reactive

---

## Writable Selectors

Selectors can update atoms.

```ts
export const countSelector = selector<number>({
  key: "countSelector",
  get: ({ get }) => get(countAtom),
  set: ({ set }, newValue) => {
    set(countAtom, newValue);
  },
});
```

Use cases:
- Form state abstraction
- Normalizing data
- Controlled derived updates

---

## Atom Family

Create dynamic atoms.

```ts
import { atomFamily } from "recoil";

export const todoAtomFamily = atomFamily<string, number>({
  key: "todoAtomFamily",
  default: "",
});
```

```tsx
const Todo = ({ id }: { id: number }) => {
  const [text, setText] = useRecoilState(todoAtomFamily(id));
  return <input value={text} onChange={e => setText(e.target.value)} />;
};
```

---

## Selector Family

Parameterized derived state.

```ts
import { selectorFamily } from "recoil";

export const charCountSelector = selectorFamily<number, number>({
  key: "charCountSelector",
  get: (id) => ({ get }) => {
    const text = get(todoAtomFamily(id));
    return text.length;
  },
});
```

---

## Async Selectors

Used for server data.

```ts
export const userSelector = selector({
  key: "userSelector",
  get: async () => {
    const res = await fetch("/api/user");
    return res.json();
  },
});
```

```tsx
const User = () => {
  const user = useRecoilValue(userSelector);
  return <div>{user.name}</div>;
};
```

Supports:
- React Suspense
- Error boundaries

---

## Effects (Atom Effects)

Run side effects when atoms change.

```ts
import { AtomEffect } from "recoil";

const localStorageEffect =
  (key: string): AtomEffect<any> =>
  ({ setSelf, onSet }) => {
    const saved = localStorage.getItem(key);
    if (saved) setSelf(JSON.parse(saved));

    onSet((newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    });
  };
```

```ts
export const themeAtom = atom({
  key: "themeAtom",
  default: "light",
  effects: [localStorageEffect("theme")],
});
```

---

## Resetting State

```tsx
import { useResetRecoilState } from "recoil";

const Reset = () => {
  const reset = useResetRecoilState(countAtom);
  return <button onClick={reset}>Reset</button>;
};
```

---

## Performance Benefits

- No global reducers
- Minimal re-renders
- Automatic dependency tracking
- Built-in memoization

---

## When to Use Recoil

Good fit when:
- Medium to large React apps
- Complex derived state
- Async-heavy frontend
- Replacing Redux boilerplate

Avoid when:
- Very small apps
- No shared state

---

## Folder Structure (Recommended)

```
src/
 ├── recoil/
 │   ├── atoms/
 │   ├── selectors/
 │   └── effects/
 ├── components/
 └── pages/
```

---

## Summary

Recoil provides:
- Atomic state model
- Simple mental model
- Powerful derived state
- Native async handling

It is a strong alternative to Redux, Zustand, and MobX for modern React apps.
