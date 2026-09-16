#!/bin/bash


version="$(grep 'version' package.json | sed -E 's/[^0-9.]*([0-9.]*)[^0-9.]*/\1/')"

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

git checkout -q page

versionInUse="$(git log --pretty=format:%s | grep -w $version)"

if [[ "$versionInUse" != "" ]]; then 
  echo "Error: Version $version already used" 1>&2
  git checkout -q -
  exit 1
fi

cp dist/assets/* assets/
cp dist/index.html ./

git add .
git commit -q -m "$version"

echo "Version $version builded with success"