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


## Setting a theme from CLI

> Warning: This will also (probably) change in the future.

```
npx elctron . --theme "./themes/dark.json"
or
npm run dev -- --theme "./themes/dark.json"
or
npm run start -- --theme "./themes/dark.json"
```

You can also enable hot reload for loaded theme with:

```
npm run start -- --theme "./themes/dark.json" --theme-watch
```

Quirks:
- Doesn't work with `npm run dev` because this argument gets lost

### TODO
delete this section after done before merge!

- toggle hover
- emoji picker border can be a bit more pronounced (especially for dark themes)
- gallery
    - tabs // do we relly need that? we will transform it into a dialog and make new styles there anyway.

- see todo comments in _bp3_overwrites.scss
    - dialog shadows in darkmode look weird
    - main menu shadow thingie looks weird in dark modes
    - map controlls hover
    - main menu seperation bars

- gradients? namely:
    - bp3 input focus
    - gradient between chatlist and chatview

- don't forget to fix standard stuff (`npm test`)
