import { ExtendedApp, AppState } from '../shared/shared-types'

export interface ExtendedAppMainProcess extends ExtendedApp {
  saveState?: (arg: AppState) => void;
  // saveState is likely not shared to renderer so the type ExtendedApp can not be shared with renderer
}