## Information how the experimental theme system works

Themes are scss files that act as themes by containing many differnt css variables.
Most of these variables are small variations of the base colors of the theme so scss allows us to generate them from the base colors to safe us work.
But of course we can overwrite those variables manualy too, we can even overwrite css classes if our theme needs it.

## Theme codes

There are two types of themes `dc`(build-in) and `custom` themes.
DeltaChat Desktop searches in two places for themes, the theme folder contained in the deltachat instalation and the theme folder in the deltachat userdata folder of the users account (custom themes).

The actual theme code is build as follows:

```
[location/type]:[name of themefile without extention]
```

Some examples:

```
dc:dark -> ./themes/dark.scss
dc:light -> ./themes/light.scss
custom:mytheme -> ~/.config/DeltaChat/custom-themes/mytheme.scss
```

There is a special code that is an exception to this: `system` it gets translated into `dc:dark` or `dc:light` depending on the system theme of the host os.

## Setting a theme from CLI

> Warning: This will also (probably) change in the future.

```
npx electron . --theme dc:dark
or
npm run dev -- --theme dc:dark
or
npm run start -- --theme dc:dark
```

You can also enable hot reload for loaded theme with:

```
npm run start -- --theme dc:dark --theme-watch
```

## Creating your own Theme:

1. copy the light or dark theme and save it to your user deltachat folder DeltaChat/custom-themes/my_theme.scss

2. start deltachat from your terminal with your theme selected in watch mode:

```sh
deltachat --theme custom:my_theme --theme-watch
```

3. Open your theme file in your favorite code/text editor and edit it,
   when you save it your changes should be applied 1-2 seconds later.

Read the comments in the theme files for additional information.
