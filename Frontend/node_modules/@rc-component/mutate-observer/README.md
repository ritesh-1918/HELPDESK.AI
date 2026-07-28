# @rc-component/mutate-observer

MutateObserver for React.


[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Codecov][codecov-image]][codecov-url]
[![bundle size][bundlephobia-image]][bundlephobia-url]
[![dumi][dumi-image]][dumi-url]

[npm-image]: https://img.shields.io/npm/v/@rc-component/mutate-observer.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@rc-component/mutate-observer
[github-actions-image]: https://github.com/react-component/mutate-observer/actions/workflows/main.yml/badge.svg
[github-actions-url]: https://github.com/react-component/mutate-observer/actions/workflows/main.yml
[codecov-image]: https://img.shields.io/codecov/c/github/react-component/mutate-observer/master.svg?style=flat-square
[codecov-url]: https://app.codecov.io/gh/react-component/mutate-observer
[david-url]: https://david-dm.org/react-component/mutate-observer
[david-image]: https://david-dm.org/react-component/mutate-observer/status.svg?style=flat-square
[david-dev-url]: https://david-dm.org/react-component/mutate-observer?type=dev
[david-dev-image]: https://david-dm.org/react-component/mutate-observer/dev-status.svg?style=flat-square
[download-image]: https://img.shields.io/npm/dm/@rc-component/mutate-observer.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rc-component/mutate-observer
[bundlephobia-url]: https://bundlephobia.com/package/@rc-component/mutate-observer
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/@rc-component/mutate-observer
[dumi-url]: https://github.com/umijs/dumi
[dumi-image]: https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square

## Development

```bash
npm install
npm run start
open http://localhost:8000
```

## Install

[![@rc-component/mutate-observer](https://nodei.co/npm/@rc-component/mutate-observer.png)](https://www.npmjs.com/package/@rc-component/mutate-observer)

## Usage

```tsx | pure
import React from 'react';
import MutateObserver from 'rc-component/mutate-observer';

const onMutate = (mutations: MutationRecord[], observer: MutationObserver) => {
  console.log(mutation);
  console.log(observer);
};

const Demo: React.FC = () => {
  return (
    <MutateObserver onMutate={onMutate}>
      <div>test</div>
    </MutateObserver>
  );
};

export default Demo;
```

## 🔥 API

We use typescript to create the Type definition. You can view directly in IDE. But you can still check the type definition [here](https://github.com/react-component/mutate-observer/blob/master/src/interface.ts).

### mutate-observer

| Prop     | Description                                                                                                      | Type                 | Default |
| -------- | ---------------------------------------------------------------------------------------------------------------- | -------------------- | ------- |
| onMutate | A function which will be called on each DOM change that qualifies given the observed node or subtree and options | MutationCallback     | -       |
| options  | An object providing options that describe which DOM mutations should be reported to mutationObserver's callback  | MutationObserverInit | -       |
