import { atom } from 'jotai'

export enum Screens {
  Welcome,
  Main,
  Login,
  Loading,
  DeleteAccount,
  NoAccountSelected,
}

const screen = atom<Screens>(Screens.Loading)

export const currentScreen = atom(get => get(screen))

export const changeScreen = atom(null, (_get, set, nextScreen: Screens) => {
  set(screen, nextScreen)
})
