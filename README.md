# `yaln` (Yet another local npm)

While developing some libraries I noticed that `npm link`, `yarn link` and also partially `yalc` sometimes have problem 
when it comes to mimicking the publish process and create an acutally working local environment.

So `yaln` will simply "create" a simple local npm registry.

It will:
- Use `npm pack` to create an actual npm package file and store it in `~/.yaln/packages/`.
- It will watch for changes of packages in `~/.yaln/packages/` and installs them locally.

## Install

    npm i -g @chbiel/yaln

Or from source

    git clone ...
    cd ...
    npm i -g .

## Usage

### In source project 

#### tsc-watch

    tsc-watch --onSuccess "yaln pack"

#### Rollup

    rollup -c --watch --watch.onBundleEnd="yaln pack"

    npm run watch --watch.onBundleEnd="yaln pack"

### In target project

    yaln watch [package list]

### Pre commit hook

Simple pre commit hook to ensure no file references in package json get committed:

```yaml
      - id: no-relative-packages
        name: no-relative-packages
        entry: bash -c "git diff --cached --name-only | grep -q 'package.json' && cat package.json | grep -E 'file:.+\/\.lnpm\/.+' && echo -e 'file references not allowed in package.json' 1>&2 && exit 1 || exit 0"
        language: system
        pass_filenames: false
```

# Known bugs

- Looks like sometimes, when the first package update gets detected, the package gets installed twice

# Missing features

- Support `yarn`
- Add command to add dependency without watch
- Allow configuration of exchangePath
- Add CommonJS support