#!/bin/bash
cd /build
rm -rf node_modules
npm install --build-from-source
npm run build
npx electron-builder -c /build-context/electron-builder-ubuntu.json
