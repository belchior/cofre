#!/bin/bash

version="$(grep 'version' package.json | sed -E 's/[^0-9.]*([0-9.]*)[^0-9.]*/\1/')"
pages="$(ls --directory src/Page/* | sed 's|src/Page/||' | sed -r 's/([A-Z])/-\L\1/g' | sed 's/^-//')"

# set the last version in a meta tag at index.html
sed -i "s/0.0.0/$version/" dist/index.html
# remove script and link introduced by vite build
sed -i -E 's/<(script|link).*index-.*//' dist/index.html

# rename builded files to include the last version of the app
for oldPath in dist/assets/*.{css,js}; do
  newPath="$(echo $oldPath | sed -E "s/-.*\./-$version./")"
  if [[ "$oldPath" != "$newPath" ]]; then
    mv $oldPath $newPath
  fi
done

# recreate all pages based on home page to fix the bug that the router gets lost 
# when the user reloads a page different from home page
for page in $pages; do
  cp dist/index.html "dist/$page.html"
done

# copy the service-worker file to dist root
cp sw.js dist/

# copy package.json to dist to provide the version of the app at deploy
cp package.json dist/

echo "Version $version builded"