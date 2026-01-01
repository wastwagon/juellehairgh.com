#!/bin/bash

# Script to replace gradients with solid pink or black colors

# Replace common gradient patterns
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) ! -path "*/node_modules/*" -exec sed -i '' \
  -e 's/bg-gradient-to-r from-purple-600 to-pink-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-r from-pink-600 to-purple-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-r from-purple-600 to-pink-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-purple-600 to-pink-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-purple-500 to-pink-500/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-pink-500 to-purple-500/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-pink-500 via-purple-500 to-rose-500/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-purple-500 to-purple-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-pink-500 to-pink-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-pink-500 to-rose-500/bg-pink-600/g' \
  -e 's/bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600/bg-pink-600/g' \
  -e 's/bg-gradient-to-b from-gray-50 via-purple-50\/20 to-pink-50\/20/bg-white/g' \
  -e 's/bg-gradient-to-br from-purple-50\/40 via-white to-pink-50\/40/bg-white/g' \
  -e 's/hover:from-purple-700 hover:to-pink-700/hover:bg-pink-700/g' \
  -e 's/hover:from-purple-50 hover:to-pink-50/hover:bg-pink-50/g' \
  -e 's/bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent/text-pink-600/g' \
  -e 's/bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent/text-pink-600/g' \
  {} \;

echo "Gradient replacement complete!"

