# CSS Guidelines
## How we go about styles

We decided to move away from styled components to pure scss, further we're going to remove the BOM syntax that remains from the signal codebase.

To avoid collisions you MUST NOT create global styles with generic names that aren't a component.
Also make sure that global module-classes don't have a class name that is allready used (search all files with `grep` or a similar tool)

When using generic classnames like `date`, `avatar`, `username`, `error` make sure to scope them in an component scss class.

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

This document is not final, feel free to ask questions and discuss this with us.