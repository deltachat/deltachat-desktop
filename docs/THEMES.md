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

The theme you set this way isn't persistant, its only for quick testing/playing-around,
so rather use the `--theme-watch` option and create your own `your-theme.json` file.

There are also some helper methods that allow you to see the theme(-data) at various points:

```js
// Get the currently active theme/-data
getCurrentlyAppliedThemeData()
getCurrentlyAppliedTheme()

// get the theme data as you set it/ like it is stored in localstorage
getCurrentTheme()

// get the default theme/-data for reference
getDefaultThemeData()
getDefaultTheme()
```

## Setting a theme from CLI

> Warning: This will also (probably) change in the future.

```
npx electron . --theme "./themes/dark.json"
or
npm run dev -- --theme "./themes/dark.json"
or
npm run start -- --theme "./themes/dark.json"
```

You can also enable hot reload for loaded theme with:

```
npm run start -- --theme "./themes/dark.json" --theme-watch
```

## Creating your own Theme:

1. create a new json file for your new theme with an epmty object as content:

```json
{}
```

2. start deltachat from your terminal with your theme selected in watch mode:

```sh
deltachat --theme ./path/to/your_theme.json --theme-watch
```

3. Open your theme file in your favorite code/text editor and edit it,
   when you save it your changes should be applied a second later.

Look into the default theme(`themes/light.json`)[../themes/light.json]) for inspiration.
If you need more controll you can use the `raw` property to overwrite generated colors, you can get a list of all availible raw-properties by running `ThemeManager.getCurrentlyAppliedThemeData()` in the DeltaChat DevConsole.
