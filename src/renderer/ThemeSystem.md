## Information how the experimental theme system works
(it's in the code, because for now its only for developers)
> Warning: This will change in the future.


There are two objects: Theme and Theme-data -> the theme-data gets generated from the theme


dev console:
```
You can set the theme like this:
window.ThemeManager.setTheme([object with theme properties you want to overwrite])

you can also overwrite theme-data directly using the raw property:
window.ThemeManager.setTheme({raw:{chatViewBg:'lime'}})

You can reset your overwrites with an empty object:
window.ThemeManager.setTheme({})
```

The theme you set gets stored in localstorage for now.

There are also some helper methods that allow you to see the theme(-data) at various points:

```js
// Get the currently active theme/-data
getCurrentlyAppliedThemeData ()
getCurrentlyAppliedTheme ()

// get the theme data as you set it/ like it is stored in localstorage
getCurrentTheme ()

// get the default theme/-data for reference
getDefaultThemeData ()
getDefaultTheme ()
```


### TODO
delete this section after done before merge!

- hamburger menu content
- bp3 overwrites (see todo/-comments in scss file)
- emojimart window (see `_emoji-mart-overwrites.scss`)

- gradients? namely:
    - bp3 input focus