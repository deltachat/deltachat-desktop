# Notification sound implementation details

in desktop settings (config.json) there is a property that stores the sound the user selected:

```ts
  /** selected notification tone
   * `silent` - no tone
   * `system` - system sound
   * `built-in:[id]`
   * `custom:[filename]` - saved to user data dir, like the background image
   */
NotificationTonePath: string | 'system' | 'silent'
```

the runtime.ts interface has a function to get all availible sound files:
```
getNotificationTones()
```

it also has functions to add files and remove the sounds form the user data dir.


TODO: handle the case that the (default) sound file is not found (should we remove one of them it should fall back to another one.)

TODO: user can add custom sounds via file chooser (subtitle "custom"?)