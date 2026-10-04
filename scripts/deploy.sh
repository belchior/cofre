#!/bin/bash

if [[ "$(git status -s)" != "" ]]; then
  echo "Error: You must commit your changes before deploying" 1>&2
  exit 1
fi

git checkout -q page

version="$(grep 'version' dist/package.json | sed -E 's/[^0-9.]*([0-9.]*)[^0-9.]*/\1/')"
versionInUse="$(git log --pretty=format:%s | grep -w $version)"

if [[ "$versionInUse" != "" ]]; then 
  echo "Error: Version $version already used" 1>&2
  git checkout -q main
  exit 1
fi

# move files from dist directory to root 
cp dist/assets/* assets/
cp dist/*.html ./
cp dist/sw.js ./

git add .
git commit -q -m "$version"
git push -q origin page
git checkout -q main

echo "Version $version deployed"