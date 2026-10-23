declare module '@mapbox/geojson-extent'
declare module '@deltachat/react-qr-reader'
// Shut up the TypeScript error
// https://www.typescriptlang.org/tsconfig/#noUncheckedSideEffectImports.
declare module 'moment/min/locales'

// Tell tsc that CSS modules are alright
declare module '*.module.css'
declare module '*.module.scss'

type todo = any

declare module 'react-virtualized-auto-sizer' {
  // taken from @types/react-virtualized
  import { PureComponent } from 'react'
  export type Size = {
    height: number
    width: number
  }
  export type Dimensions = Size
  export type AutoSizerProps = {
    /**
     * Function responsible for rendering children.
     * This function should implement the following signature:
     * ({ height, width }) => PropTypes.element
     */
    children: (props: Size) => React.ReactNode
    /**
     *     Optional custom CSS class name to attach to root AutoSizer element.
     * This is an advanced property and is not typically necessary.
     */
    className?: string
    /**
     * Height passed to child for initial render; useful for server-side rendering.
     * This value will be overridden with an accurate height after mounting.
     */
    defaultHeight?: number
    /**
     * Width passed to child for initial render; useful for server-side rendering.
     * This value will be overridden with an accurate width after mounting.
     */
    defaultWidth?: number
    /** Disable dynamic :height property */
    disableHeight?: boolean
    /** Disable dynamic :width property */
    disableWidth?: boolean
    /** Nonce of the inlined stylesheet for Content Security Policy */
    nonce?: string
    /** Callback to be invoked on-resize: ({ height, width }) */
    onResize?: (info: Size) => any
    /**
     * Optional custom inline style to attach to root AutoSizer element.
     * This is an advanced property and is not typically necessary.
     */
    style?: React.CSSProperties
    /**
     * PLEASE NOTE
     * The [key: string]: any; line is here on purpose
     * This is due to the need of force re-render of PureComponent
     * Check the following link if you want to know more
     * https://github.com/bvaughn/react-virtualized#pass-thru-props
     */
    [key: string]: any
  }
  /**
   * Decorator component that automatically adjusts the width and height of a single child.
   * Child component should not be declared as a child but should rather be specified by a `ChildComponent` property.
   * All other properties will be passed through to the child component.
   */
  class AutoSizer extends PureComponent<AutoSizerProps, Size> {
    static defaultProps: {
      onResize: () => void
      disableHeight: false
      disableWidth: false
      style: {}
    }
    constructor(props: AutoSizerProps)
    componentDidMount(): void
    componentWillUnmount(): void
    render(): React.ReactElement
  }
  export default AutoSizer
}

// The package's own `lib/index.d.ts` doesn't type-check,
// so we import the component from its internal path and type it here.
declare module 'react-filerobot-image-editor/lib/components/AssemblyPoint' {
  import type { FunctionComponent } from 'react'

  type AnnotationConfig = {
    fill?: string
    stroke?: string
    strokeWidth?: number
  }

  export type SavedImageData = {
    name: string
    extension: string
    mimeType: string
    fullName?: string
    width?: number
    height?: number
    imageBase64?: string
  }

  export type FilerobotImageEditorConfig = {
    source: string | HTMLImageElement
    useBackendTranslations?: boolean
    translations?: { [key: string]: string }
    tabsIds?: ('Adjust' | 'Annotate' | 'Resize' | 'Finetune' | 'Filters')[]
    /** tools shown per tab; replaces Filerobot's default map entirely */
    tabsToolsIds?: { [tabId: string]: string[] }
    defaultTabId?: string
    defaultToolId?: string
    Text?: AnnotationConfig & { text?: string; fontSize?: number }
    Pen?: AnnotationConfig
    Line?: AnnotationConfig
    Arrow?: AnnotationConfig & { pointerLength?: number; pointerWidth?: number }
    Rect?: AnnotationConfig
    Ellipse?: AnnotationConfig
    avoidChangesNotSavedAlertOnLeave?: boolean
    savingPixelRatio: number
    previewPixelRatio: number
    defaultSavedImageName?: string
    defaultSavedImageType?: 'png' | 'jpeg' | 'jpg' | 'webp'
    /** return `false` to skip the built-in "save as" dialog */
    onBeforeSave?: (savedImageData: SavedImageData) => void | boolean
    onSave?: (savedImageData: SavedImageData, designState: object) => void
    /** called on every change of the image (annotations, crop, rotation, …) */
    onModify?: (designState: object) => void
    onClose?: (closeReason: string, haveNotSavedChanges: boolean) => void
  }

  const FilerobotImageEditor: FunctionComponent<FilerobotImageEditorConfig>
  export default FilerobotImageEditor
}
