### @ant-design/react-slick

---

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Codecov][codecov-image]][codecov-url]
[![bundle size][bundlephobia-image]][bundlephobia-url]

[npm-image]: http://img.shields.io/npm/v/@ant-design/react-slick.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@ant-design/react-slick
[github-actions-image]: https://github.com/ant-design/react-slick/actions/workflows/ci.yml/badge.svg
[github-actions-url]: https://github.com/ant-design/react-slick/actions/workflows/ci.yml
[codecov-image]: https://img.shields.io/codecov/c/github/ant-design/react-slick/master.svg?style=flat-square
[codecov-url]: https://app.codecov.io/gh/ant-design/react-slick
[download-image]: https://img.shields.io/npm/dm/@ant-design/react-slick.svg?style=flat-square
[download-url]: https://npmjs.org/package/@ant-design/react-slick
[bundlephobia-url]: https://bundlephobia.com/package/@ant-design/react-slick
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/@ant-design/react-slick
[dumi-url]: https://github.com/umijs/dumi
[dumi-image]: https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square

##### Carousel component built with React. It is a react port of [slick carousel](http://kenwheeler.github.io/slick/)

## [Documentation](http://react-slick.neostack.com)

### Installation

**npm**

```bash
npm install @ant-design/react-slick --save
```

**yarn**

```bash
yarn add @ant-design/react-slick
```

**Also install slick-carousel for css and font**

```bash
npm install slick-carousel

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
```

or add cdn link in your html

```html
<link
  rel="stylesheet"
  type="text/css"
  charset="UTF-8"
  href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css"
/>
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css"
/>
```

### [PlayGround](https://stackblitz.com/edit/vitejs-vite-ownrun?file=src%2FImageSlider.jsx)

### Example

```js
import React from "react";
import Slider from "@ant-design/react-slick";

export default function SimpleSlider() {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };
  return (
    <Slider {...settings}>
      <div>
        <h3>1</h3>
      </div>
      <div>
        <h3>2</h3>
      </div>
      <div>
        <h3>3</h3>
      </div>
      <div>
        <h3>4</h3>
      </div>
      <div>
        <h3>5</h3>
      </div>
      <div>
        <h3>6</h3>
      </div>
    </Slider>
  );
}
```

### Props

For all available props, go [here](https://react-slick.neostack.com/docs/api/).

### Methods

For all available methods, go [here](https://react-slick.neostack.com/docs/api#methods)

### Development

Want to run demos locally

```bash
git clone https://github.com/ant-design/react-slick
cd react-slick
npm install
npm start
open http://localhost:8080
```

## Community

Join our [discord channel](https://discord.gg/z7stRE4Cyb) to discuss react-slick bugs and ask for help

## Contributing

Please see the [contributing guidelines](./CONTRIBUTING.md)
