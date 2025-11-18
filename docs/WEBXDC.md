# Webxdc Implementation

This document explains how Webxdc apps are integrated and executed within Delta Chat Desktop (Electron edition).

## Overview

[Webxdc](https://webxdc.org/) is a standard for sandboxed, cross-platform web applications that can be shared in messengers. The integration consists of several layers that work together to provide a secure, isolated environment for running these apps while maintaining the ability to communicate with the Delta Chat core.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               Delta Chat Desktop (Main Process)                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. Main Webxdc Controller                                       │
│    - BrowserWindow management                                   │
│    - IPC handlers                                               │
│    - Protocol registration                                      │
│    - Security policies                                          │
├─────────────────────────────────────────────────────────────────┤
│ 2. Custom Protocol Handler (webxdc://)                          │
│    - Serves Webxdc app files                                    │
│    - Injects webxdc.js API                                      │
│    - CSP enforcement                                            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Sandboxed BrowserWindow (Renderer Process)         │
├─────────────────────────────────────────────────────────────────┤
│ 3. Wrapper HTML (webxdc_wrapper.html)                           │
│    - Container iframe                                           │
├─────────────────────────────────────────────────────────────────┤
│    - IPC bridge to main process                                 │
│    - Context isolation bridge                                   │
│ 4. Preload Script (webxdc-preload.js)                           │
│    - webxdc API implementation                                  │
├─────────────────────────────────────────────────────────────────┤
│ 5. Webxdc App Content (iframe)                                  │
│    - The actual Webxdc application                              │
│    - Isolated from parent context                               │
│    - Access to webxdc API only                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Analysis

### 1. Main Webxdc Controller ([src/deltachat/webxdc.ts](/packages/target-electron/src/deltachat/webxdc.ts))

- Creates isolated BrowserWindow instances for each Webxdc app
- Manages app lifecycle (open/close/focus)
- Implements IPC handlers for Webxdc API calls
- Registers custom protocol handlers
- Enforces security policies and permissions

**Key Features:**

- All Webxdc apps of a single account run in one isolated session
- Content Security Policy (CSP) enforcement
- Permission management (only allows specific web APIs)
- Window state persistence (bounds, position)

### 2. Custom Protocol Handler (`webxdc://`)

A custom Electron protocol that serves Webxdc app content:

```
webxdc://{accountId}.{messageId}.webxdc/
├── webxdc_wrapper.html          # Main wrapper page
├── webxdc.js                    # API initialization script
├── index.html                   # Webxdc app entry point
├── app.js                       # Webxdc app JavaScript
├── style.css                    # Webxdc app styles
└── [other app assets]           # Images, data files, etc.
```

**Security Measures:**

- All responses include strict Content Security Policy headers
- PDF files are served as octet-stream to prevent PDF viewer exploitation
- Network access is restricted
- MIME type validation
- [hostRules](/packages/target-electron/src/index.ts#L12) for Chrome to block any dns requests

### 3. Wrapper HTML ([static/webxdc_wrapper.html](/packages/target-electron/static/webxdc_wrapper.html))

A minimal HTML container that:

- Hosts the Webxdc app in an iframe for additional isolation
- Adds another layer of sandboxing

### 4. Preload Script ([static/webxdc-preload.js](/packages/target-electron/static/webxdc-preload.js))

The bridge between the Webxdc app and the main process:

```javascript
// Exposes the Webxdc API to the iframe
window.webxdc = {
  selfAddr: '...',
  selfName: '...',
  setUpdateListener: (callback, serial) => {
    /* IPC to main */
  },
  sendUpdate: (update, description) => {
    /* IPC to main */
  },
  joinRealtimeChannel: () => {
    /* Real-time communication */
  },
  sendToChat: content => {
    /* Send message to chat */
  },
  importFiles: filters => {
    /* File picker dialog */
  },
}
```

**Key responsibilities:**

- Implements the complete [Webxdc API specification](https://webxdc.org/docs/spec/index.html)
- Manages IPC communication with the main process
- Handles update listeners and real-time data
- Provides file import/export capabilities

### 5. Webxdc App Isolation

The actual Webxdc app runs in a sandboxed environment:

**Sandbox Features:**

- Context isolation enabled
- Node.js integration disabled
- Web security enabled
- Navigation restricted
- Limited permissions (only fullscreen and pointer lock allowed)

**Communication Channels:**

- Webxdc API calls => IPC => Main process => Delta Chat core
- Real-time data via dedicated IPC channels
- File operations through IPC bridges

## Bootstrap Sequence

1. **App Launch**: User clicks on Webxdc message
2. **Window Creation**: Main process creates isolated BrowserWindow
3. **Protocol Registration**: Custom `webxdc://` handler is set up for this session
4. **Wrapper Loading**: Browser loads `webxdc_wrapper.html` from protocol handler
5. **Preload Injection**: `webxdc-preload.js` is injected and sets up the API bridge
6. **API Setup**: `webxdc.js` script initializes the API with app-specific data
7. **App Loading**: The iframe loads the actual Webxdc app (`index.html`)
8. **Ready State**: App is fully loaded and can interact with the Webxdc API

## Security Model

### Multi-Layer Isolation

1. **Process Isolation**: Each Webxdc app runs in its own renderer process
2. **Session Isolation**: Apps have separate storage, cookies and cache (per account)
3. **Context Isolation**: Preload script runs in isolated context
4. **Iframe Sandboxing**: Additional iframe isolation within the renderer
5. **CSP Enforcement**: Strict Content Security Policy on all responses

### Permission Model

Webxdc apps have extremely limited permissions:

- **Allowed**: Fullscreen, pointer lock (for games)
- **Blocked**: Camera, microphone, geolocation, notifications, etc.
- **Network**: Controlled per-app (some apps can access internet via maps:// protocol)

### Content Security Policy

```javascript
const CSP =
  "default-src 'self';\
  style-src 'self' 'unsafe-inline' blob: ;\
  font-src 'self' data: blob: ;\
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ;\
  connect-src 'self' data: blob: ;\
  img-src 'self' data: blob: ;\
  media-src 'self' data: blob: ;\
  webrtc 'block'"
```

## Real-time Communication

WebRTC is disabled by setting WebRTCIPHandlingPolicy to 'disable_non_proxied_udp' for each BrowserWindow. This should force any WebRTC request to use the dummy proxy provided in [webxdc.ts](../packages/target-electron/src/deltachat/webxdc.ts#L123) (see comments [here](../packages/target-electron/src/deltachat/webxdc.ts#L325))

Webxdc apps can communicate in real-time through:

- **Status Updates**: Persistent state changes shared between all app instances
- **Realtime Channel**: Ephemeral binary data for real-time features
- **Chat Integration**: Ability to send messages to the hosting chat

## File System Access

Webxdc apps access files through secure channels:

- **Blob Storage**: Files are stored in Delta Chat's blob storage
- **Import/Export**: Secure file picker and drag-out functionality
- **Temporary Files**: Secure temporary file creation for exports

## Internet Access

Webxdc apps can't access the internet with one exception:

- **Controlled Access**: Only integrated and explicitly allowed apps get internet access (granted by core)
- **CSP Relaxation**: Internet-enabled apps get modified CSP for external resources

The integrated maps.xdc has access to internet via a custom maps protocol (to get map data from different map services). If a webxdc app has `request_integration = 'map'` in it's manifest and is saved to Saved messages (selfChat), it will replace the integrated maps.xdc. Note that this is an experimental feature and the implementation will probably change until we have final solution for integrated apps.

### Security Considerations

- Always use `makeResponse()` to ensure CSP headers are set
- Validate all user input from Webxdc apps
- Be cautious with new permission grants

After changes in the implementation make sure to **test new features** with [webxdc test app](https://github.com/webxdc/webxdc-test)!

## Related Files

- [/packages/target-electron/src/deltachat/webxdc.ts](/packages/target-electron/src/deltachat/webxdc.ts) - Main controller
- [/packages/target-electron/static/webxdc-preload.js](/packages/target-electron/static/webxdc-preload.js) - Preload script with Webxdc API
- [/packages/target-electron/static/webxdc_wrapper.html](/packages/target-electron/static/webxdc_wrapper.html) - Wrapper HTML container
- Package `@webxdc/types` - TypeScript definitions for Webxdc API

## External References

- [Webxdc Specification](https://webxdc.org/)
- [Electron Security Guide](https://www.electronjs.org/docs/latest/tutorial/security)
