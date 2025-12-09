# `yaln` (Yet another local npm)

## Intention

While developing libraries, using `npm link`, `yarn link` and also partially `yalc` sometimes introduce wierd problems.
Especially there can be difference between a built and a linked package.

This package was created to get around those limitations and mimik a real local installation of package in an easy way.

## How it works

`yaln` uses `npm pack` to create an actual npm package file and store it in `~/.yaln/packages/`. 
Those built packages can be installed in other repositories.
It can watch for changes of packages in `~/.yaln/packages/` and installs them locally or install them once.

## Install

    npm i -g @chbiel/yaln

Or from source

    git clone ...
    cd ...
    npm i -g .

## Usage

```shell
# In library / source project
# Plain
yaln pack

# With tsc-watch
tsc-watch --onSuccess "yaln pack"

# With rollup
rollup -c --watch --watch.onBundleEnd="yaln pack"
```

```shell
# In the target project
# Plain
yaln install [package list]

# With watch
yaln watch [package list]
```

### Pre commit hook

To ensure, that no local file references are committed to `package.json`, you can use the following pre-commit hook:

```yaml
- id: no-relative-packages
  name: no-relative-packages
  entry: bash -c "git diff --cached --name-only | grep -q 'package.json' && cat package.json | grep -E 'file:.+\/\.yaln\/.+' && echo -e 'file references not allowed in package.json' 1>&2 && exit 1 || exit 0"
  language: system
  pass_filenames: false
```

# Known bugs

- Looks like sometimes, when the first package update gets detected while using `watch`, the package gets installed twice

# Missing features

- Support `yarn`
- Allow configuration of exchangePath