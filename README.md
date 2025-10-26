# 🥚 code-easter-eggs (eggify)

**Add hidden easter eggs and cheat codes to your website with one line.**

```bash
npm install code-easter-eggs
```

## Features
- Lightweight (~1-2 KB gzipped)
- Custom cheat code patterns
- Optional key delay limit
- Works with AbortController
- Ignores input/textarea by default
- Works in browsers and bundlers

## How to use it
**ESM**
```javascript
import { onCheatCode } from "code-easter-eggs";

onCheatCode("↑↑↓↓←→←→BA", () => {
  alert("🥚 Secret unlocked!");
});
```

**CJS**
```javascript
const { onCheatCode } = require("code-easter-eggs");

onCheatCode("↑↑↓↓←→←→BA", () => {
  console.log("hi!");
});
```

**Browser (UMD/IIFE)**
```javascript
<script src="https://unpkg.com/code-easter-eggs/dist/index.global.js"></script>
<script>

  Eggify.onCheatCode("↑↑↓↓←→←→BA", () => alert("🥚"));

  window.onCheatCode("↑↑↓↓←→←→BA", () => alert("🥚 (shim)"));
</script>
```
**Global**
```javascript
import "code-easter-eggs";
window.onCheatCode!("↑↑↓↓←→←→BA", () => { /* ... */ });

```

## Collaborate
```bash
# build
npm run build

# create local package
npm pack

# test in other project
mkdir ../eggify-test && cd ../eggify-test
npm init -y
npm install ../ruta/a/eggify-1.0.0.tgz

# link to dev
npm link
# in eggify-test/
npm link eggify

# serve html example
npx http-server ./local-browser-test -p 4000
# open http://localhost:4000
```

## Size check
npm install -g gzip-size-cli

gzip-size dist/index.js dist/index.cjs dist/index.global.js

1.26 kB

## 🧠 AI Usage Notice

AI was used as a tool for assistance — for example, to write comments, extract certain types, or configure some options.  
However, this is **NOT** an AI-driven coding project.

If you wish to contribute code that involves AI assistance, please add a comment at the end of the file stating:

```javascript
// Contains AI-generated code
```

so it can be reviewed in more detail.

(Fragment created using AI)

I will add custom instructions for copilot in the near future

## License
Beerware 🍺 — do whatever you want with it, but if we meet, buy me a beer. (This is essentially MIT-like. Use it freely, but if we meet, buy me a beer)
