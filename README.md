# SvelteKit Firebase Function Adapter

This is just a copy / adapted version of [Official Vercel Adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel) to make working with firebase **function & hosting**.

**⚠️DISCLAIMER: Do with your own risk!⚠️**

## Install
```
npm install adapter-firebase-function
```

## Usage

```
// svelte.config.js
...
import firebase from 'adapter-firebase-function'
...

...
target: '#svelte',
adapter: firebase()
...
```

### Build
```
npm run build
```

This adapter will generate function and hosting directory under `.firebase`

### Firebase Config
Minimal firebase config
```
{
  "hosting": {
    "public": ".firebase/hosting",
    "rewrites": [
      {
        "source": "**",
        "function": "ssr"
      }
    ]
  },
  "functions": {
    "predeploy": [],
    "source": ".firebase/function",
    "runtime": "nodejs12"
  }
}
```

