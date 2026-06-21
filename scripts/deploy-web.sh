#!/bin/bash
set -e

# Build
npx expo export --platform web

# Deploy — JS goes into webapp/_expo/ (NOT repo-root _expo/)
# index.html references /Drawn/webapp/_expo/... so it must be there
cp dist/index.html webapp/index.html
rm -rf webapp/_expo
cp -r dist/_expo webapp/_expo

echo "Build output copied to webapp/. Ready to commit and push."
