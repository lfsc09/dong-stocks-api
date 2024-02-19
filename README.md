### Initialize

```
npm init --init-author-name "lfsc09@gmail.com" -y
```

```
{
    "scripts": {
        "build": "rimraf ./build && tsc",
        "start": "npm run build && node build/app.js",
        "dev": "npx nodemon"
    }
}
```

### Import List

```
npm install --save express
npm install --save-dev @types/node @types/express
npm install --save-dev typescript
npm install --save-dev ts-node nodemon
npm install --save-dev rimraf
```

### Config Enviroment

###### Generate tsconfig.json

```
npx tsc --init --rootDir src --outDir build --esModuleInterop --resolveJsonModule --lib es6 --module commonjs --allowJs true --noImplicitAny true --removeComments true
```

###### Add nodemon.json (For Cold Reloading)

```
{
  "watch": ["src"],
  "ext": ".ts,.js",
  "ignore": [],
  "exec": "npx ts-node ./src/app.ts"
}
```

###### .gitignore

```
.DS_Store
node_modules
build
.env
.env.*
!.env.*.example
```
