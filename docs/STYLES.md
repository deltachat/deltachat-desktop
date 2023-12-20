# CSS Guidelines

We use `prettier` for CSS formatting. Use `npm run fix:format` before committing to format the code.

## How we go about styles

### CSS modules

- **The goal is to separate every component style-wise as much as possible from each other, so changing the style of a single component doesn't affect anything else**
- Every CSS file is named `styles.module.css` or `styles.module.scss` when using SCSS
- It is imported via `import styles from './styles.module.css'`
- Every CSS module file lives right _next_ to the component
- Prefer repetition of styles over DRY

### General

- Prefer `padding-top`, `padding-bottom`, `padding-left` etc. over `padding` to avoid bugs through order-critical dependencies between properties, except when you only need `padding` or `border` etc.
- Try to avoid hacky `!important` as much as possible (goal is to get rid of them altogether at one point)
- If you can choose, prefer CSS over SCSS, CSS supports nesting and variables and cool functions, like `calc`!

### Naming

- Class names and variable names are always camelCase (`.searchInput`, `--borderRadius`, etc.)
- The class name should represent the React component it relates to (for example `SearchInput` is represented with `.searchInput`)
- Sub-classes are usually modifiers of the component and can have short, "local" names (like `.active` or `.warning`)

### Ordering

- Properties are sorted alphabetically
- Order of groups: variables (`--borderRadius`), properties (`height: 10px;`), pseudo elements (`::before`), sub-classes (`.active`), always separated with a newline
- Classes (`.searchInput` etc.) are also always separated with a newline

### Variables

- "Local" variables (which are used across multiple classes in the same file) are introduced at the beginning of the document. We use SCSS for defining local variables (`$borderRadius: 10px;`)
- Global variables (used across files) are defined for themes and we use CSS for that (`var(--primaryColor)`)

## How do we do colors and theming

We use CSS variables for theming, we use SCSS to generate them from a small set of base colors, see [THEMES.md](./THEMES.md) for more general information about theming.

The scss vars should be named in snake-case (we still use camelCase for some variables, but we decided to switch to snake-case, because electron/chromium doesn't support CSS var autocompletion for camelCase)

This document is not final, feel free to ask questions and discuss this with us.
