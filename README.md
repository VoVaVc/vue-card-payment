# VueCardPayment

[![npm](https://img.shields.io/npm/v/vue-card-payment.svg)](https://www.npmjs.com/package/vue-card-payment) [![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

> A Vue.js Plugin

## Installation

```bash
npm install --save vue-card-payment
```

## Usage

### Bundler (Webpack, Rollup)

```js
import Vue from 'vue'
import VueCardPayment from 'vue-card-payment'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'vue-card-payment/dist/vue-card-payment.css'

Vue.use(VueCardPayment)
```

### Browser

```html
<!-- Include after Vue -->
<!-- Local files -->
<link rel="stylesheet" href="vue-card-payment/dist/vue-card-payment.css"></link>
<script src="vue-card-payment/dist/vue-card-payment.js"></script>

<!-- From CDN -->
<link rel="stylesheet" href="https://unpkg.com/vue-card-payment/dist/vue-card-payment.css"></link>
<script src="https://unpkg.com/vue-card-payment"></script>
```

## Development

### Launch visual tests

```bash
npm run dev
```

### Launch Karma with coverage

```bash
npm run dev:coverage
```

### Build

Bundle the js and css of to the `dist` folder:

```bash
npm run build
```


## Publishing

The `prepublish` hook will ensure dist files are created before publishing. This
way you don't need to commit them in your repository.

```bash
# Bump the version first
# It'll also commit it and create a tag
npm version
# Push the bumped package and tags
git push --follow-tags
# Ship it 🚀
npm publish
```

## License

[MIT](http://opensource.org/licenses/MIT)
