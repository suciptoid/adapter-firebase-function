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

### Options

| options | default |
|---------|---------|
| minify  | false   |

Add `firebase({ minify: true })` to reduce output file size

### Build
```
npm run build
```


### Firebase Config
Minimal firebase config, auto generated if not exists
```
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**",
        "function": "ssr"
      }
    ]
  },
  "functions": {
    "predeploy": [],
    "source": "functions",
    "runtime": "nodejs12"
  }
}
```

