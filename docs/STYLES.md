# CSS Guidelines

We use `prettier` for code formatting,
use `npm run fix-formatting` before committing to format the code.

## How we go about styles

We decided to move away from styled components to pure SCSS, further we're going to remove the BOM syntax that remains from the signal codebase.

To avoid collisions you MUST NOT create global styles with generic names that aren't a component.
Also make sure that global module-classes don't have a class name that is already used (search all files with `grep` or a similar tool)

When using generic class names like `date`, `avatar`, `username`, `error` make sure to scope them in a component scss class.

```scss
.metadata {
  .date {
    color: green;
  }
  .avatar {
    background: url('profile.png');
  }
  .error {
    color: red;
  }
}
```

## How do we do colors and theming

We use CSS variables for theming, we use SCSS to generate them from a small set of base colors, see [THEMES.md](./THEMES.md) for more general information about theming.

The scss vars should be named in snake-case (we still use camelCase for some variables, but we decided to switch to snake-case, because electron/chromium doesn't support CSS var autocompletion for camelCase)

<br>
This document is not final, feel free to ask questions and discuss this with us.
