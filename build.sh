#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist/assets
cp index.html styles.css script.js manus-routes.json dist/
cp assets/curriculo-img-000.png dist/assets/
cp assets/curriculo-img-001.png dist/assets/
