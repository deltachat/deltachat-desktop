# CSS Guidelines

We use `prettier` for CSS formatting. Use `pnpm -w fix:format` before committing to format the code.

## How we go about styles

### CSS modules

- You can read more about CSS modules [here](https://css-tricks.com/css-modules-part-1-need/)
- **The goal is to separate every component style-wise as much as possible from each other, so changing the style of a single component doesn't affect anything else**
- Every CSS file is named `styles.module.css` or `styles.module.scss` when using SCSS
- It is imported via `import styles from './styles.module.css'`
- Every CSS module file lives right _next_ to the component
- Prefer repetition of styles over DRY

### General

- Prefer `padding-top`, `padding-bottom`, `padding-left` etc. over `padding` to avoid bugs through order-critical dependencies between properties, except when you only need `padding` or `border` etc.
- Avoid `padding-right`, `margin-left`, `float: left` and so on, instead use `padding-inline-end`, `margin-inline-start` and `float: inline-start` to avoid bugs with RTL Layout (some languages are written right to left, so the interface should also be "mirrored").
- Try to avoid hacky `!important` as much as possible (goal is to get rid of them altogether at one point), if your components are well composed and styles isolated you don't need them
- Avoid setting styles directly on elements via the `style` attribute. Exception: the value is dynamically set through an JavaScript variable
- Prefer `0` instead of `0px` when setting zero values
- If you can choose, prefer CSS over SCSS, CSS supports nesting and variables and cool functions, like `calc`!

### Naming

- Class names and variable names are always camelCase (`.searchInput`, `--borderRadius`, etc.)
- The class name should represent the React component it relates to (for example `SearchInput` is represented with `.searchInput`)
- Sub-classes are usually modifiers of the component and can have short, "local" names (like `.active` or `.warning`)

### Ordering and format

- Order of groups: variables (`--borderRadius`), properties (`height: 10px;`), pseudo elements (`::before`), sub-classes (`.active`), always separated with a newline
- Classes (`.searchInput` etc.) are also always separated with a newline

### Variables

- "Local" variables (which are used across multiple classes in the same file) are introduced at the beginning of the document. We use SCSS for defining local variables (`$borderRadius: 10px;`)
- Global variables (used across files) are defined for themes and we use CSS for that (`var(--primaryColor)`)

### Legacy

There's still a lot of globally defined CSS code around. Whenever you touch upon styling an old component, use it as an opportunity to refactor it to CSS modules. Usually it is as easy as copy-pasting it into an `styles.module.scss` file and removing the old styles. Watch our for breaking themes!

Sometimes old CSS is not even used, or most of its variations are not used anymore. Whenever you look into refactoring it, have a general analysis first of what is actually really needed.

## How do we do colors and theming

We use CSS variables for theming, we use SCSS to generate them from a small set of base colors, see [THEMES.md](./THEMES.md) for more general information about theming.

The scss vars should be named in snake-case (we still use camelCase for some variables, but we decided to switch to snake-case, because electron/chromium doesn't support CSS var autocompletion for camelCase)

This document is not final, feel free to ask questions and discuss this with us.
