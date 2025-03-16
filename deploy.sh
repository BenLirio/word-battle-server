#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking repository status before deployment...${NC}"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo -e "${RED}Error: Not in a git repository.${NC}"
  exit 1
fi

# Fetch the latest changes from remote
echo "Fetching latest changes from remote..."
git fetch

# Check for uncommitted changes
if ! git diff --quiet; then
  echo -e "${RED}Error: You have uncommitted changes in your working directory.${NC}"
  git status
  exit 1
fi

# Check for staged but uncommitted changes
if ! git diff --staged --quiet; then
  echo -e "${RED}Error: You have staged changes that are not committed.${NC}"
  git status
  exit 1
fi

# Check if local branch is behind remote
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ $LOCAL = $REMOTE ]; then
  echo -e "${GREEN}Repository is up to date with remote.${NC}"
elif [ $LOCAL = $BASE ]; then
  echo -e "${RED}Error: Your local branch is behind the remote. Please pull before deploying.${NC}"
  exit 1
elif [ $REMOTE = $BASE ]; then
  echo -e "${RED}Error: Your local branch is ahead of the remote. Please push before deploying.${NC}"
  exit 1
else
  echo -e "${RED}Error: Your local and remote branches have diverged. Please resolve before deploying.${NC}"
  exit 1
fi

# All checks passed, run deployment
echo -e "${GREEN}All checks passed! Starting deployment...${NC}"
npm run deploy

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment completed successfully!${NC}"
else
  echo -e "${RED}Deployment failed with error code $?.${NC}"
  exit 1
fi