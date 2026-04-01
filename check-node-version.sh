#!/bin/bash

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.17.0"

echo "Current Node.js version: v$NODE_VERSION"
echo "Required Node.js version: >= v$REQUIRED_VERSION"

# Use version comparison (basic comparison, works for major version differences)
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Node.js version is compatible"
    exit 0
else
    echo "❌ Node.js version is NOT compatible"
    echo ""
    echo "Please upgrade Node.js to version $REQUIRED_VERSION or higher."
    echo "You can use nvm to manage Node.js versions:"
    echo "  nvm install $REQUIRED_VERSION"
    echo "  nvm use $REQUIRED_VERSION"
    echo ""
    echo "Or if you have nvm, you can use the .nvmrc file:"
    echo "  nvm use"
    exit 1
fi