import type { BuildInfo as BuildInfoType } from '@deltachat-desktop/shared/shared-types'

// `BUILD_INFO_JSON_STRING` is replaced by esbuild during bundling
//@ts-ignore
export const BuildInfo: BuildInfoType = JSON.parse(BUILD_INFO_JSON_STRING)
