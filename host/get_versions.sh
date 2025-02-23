#!/bin/bash

# Get versions of specified packages and output them in a readable format,
# using Yarn when possible, handling transitive dependencies and missing packages.

packages=(
  "react-native"
  "react"
  "@react-navigation/native"
  "@react-navigation/native-stack"
  "@react-navigation/bottom-tabs"
  "react-native-safe-area-context"
  "react-native-screens"
  "@callstack/repack"
  "@rspack/core"
  "@rspack/cli"
)

echo "Package Versions:"
echo "-----------------"

# Check if Yarn is being used
use_yarn=false
if [ -f "yarn.lock" ]; then
  use_yarn=true
fi

for package in "${packages[@]}"; do
  if $use_yarn; then
    # Use yarn why, and extract the version using a more robust jq method.
    version=$(yarn why "$package" --json 2>/dev/null | jq -r '
      .data.trees[0].version //
      .data.body[0][1] //
      empty
    ' | head -n 1)

    if [ -z "$version" ]; then
      version="NOT INSTALLED"
    fi
  else
    # Use npm list, and handle missing packages more reliably.
    version=$(npm list "$package" --depth=0 --json 2>/dev/null | jq -r ".dependencies.\"$package\".version // empty")
    if [ -z "$version" ]; then
      version="NOT INSTALLED"
    fi
  fi

  printf "%-35s : %s\n" "$package" "$version"
done

echo "-----------------"

# Add react-native info output, using yarn if available
echo "React Native Info:"
if $use_yarn; then
  yarn react-native info
else
  npx react-native info
fi

echo "------------------"
echo "Rspack Config:"
cat rspack.config.mjs
