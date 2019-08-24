
ReactTable HOC fixed columns
---
[![npm version](https://img.shields.io/npm/v/react-table-hoc-fixed-columns.svg?style=flat-square)](https://www.npmjs.com/package/react-table-hoc-fixed-columns)
[![npm downloads](https://img.shields.io/npm/dm/react-table-hoc-fixed-columns.svg?style=flat-square)](https://www.npmjs.com/package/react-table-hoc-fixed-columns)

Higher Order Components for [ReactTable v6](https://github.com/tannerlinsley/react-table/tree/v6). It make possible to fixed one or more columns on the left and/or on the right. It use `position: sticky` for recent browsers, and [fallback for legacy browser](#legacy-browsers).

# Documentation

* [Demo on CodeSandbox](https://codesandbox.io/s/kowzlm5jp7)
* [Install](#install)
* [Simple example](#simple-example)
* [Props](#props)
* [Legacy browsers](#legacy-browsers)
* [Contribute](#contribute)

## Version 1
Documentation of previous v1 [here](https://github.com/GuillaumeJasmin/react-table-hoc-fixed-columns/tree/v1)

## Features
* fix columns on the left and / or on the right side
* fixed columns can be a group
* works with fixed header
* `-striped` and `-highlight` className still working, even on fixed columns
* fixed columns are resizable
* works with differents cell height
* fallback for legacy browsers

<a href="#install"></a>
## Install

```bash
npm install react-table-hoc-fixed-columns --save
```


## Simple example

It's really simple: add `fixed` property to your columns with value `left` and `right`


```js
import ReactTable from 'react-table';
import "react-table/react-table.css";
import withFixedColumns from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css' // important: this line must be placed after react-table css import

const ReactTableFixedColumns = withFixedColumns(ReactTable);
...
render () {
  return (
    <ReactTableFixedColumns
      data={data}
      columns={[
        {
          Header: 'First Name',
          accessor: 'firstName',
          fixed: 'left',
        },
        {
          Header: 'Last Name',
          accessor: 'lastName',
          fixed: 'left',
        },
        ...
        {
          Header: 'age',
          accessor: 'age',
          fixed: 'right',
        }
      ]}
    />
  )
}
```

Fixed columns also work with groups.

*Tips:* if your table contain at least one header group, place yours fixed columns into a group too (even with an empty Header name)

```js
import ReactTable from 'react-table';
import "react-table/react-table.css";
import withFixedColumns from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css' // important: this line must be placed after react-table css import

const ReactTableFixedColumns = withFixedColumns(ReactTable);
...
render () {
  return (
    <ReactTableFixedColumns
      data={data}
      columns={[
        {
          Header: 'Group names',
          fixed: 'left',
          columns: [
            {
              Header: 'First Name',
              accessor: 'firstName',
            },
            {
              Header: 'Last Name',
              accessor: 'lastName',
            },
          ]
        },
        {
          Header: 'Other group',
          columns: [
            ...
          ]
        }
      ]}
    />
  )
}
```
  
## Props

There is some custom props that can be usefull

* `innerRef` - ref to the ReactTable component
  ```js
  render () {
    return (
      <ReactTableFixedColumns
        innerRef={(ref) => { this.tableRef = ref; }}
      />
    )
  }
  ```

## Legacy browsers

If the browser doesn't support `position: sticky`, there is a fallback with `transform: translate3d()` on each scroll event. The animation is not always smooth, it depend on your browser, OS, and scroll trigger (mouse wheel or scroll bar), but it works.

You can force to use only legacy browsers version:

```js
import { withFixedColumnsScrollEvent } from 'react-table-hoc-fixed-columns'
import ReactTable from 'react-table';

const Table = withFixedColumnsScrollEvent(ReactTable);
```

or also force only sticky position version:

```js
import { withFixedColumnsStickyPosition } from 'react-table-hoc-fixed-columns'
...
```


Check sticky support [https://caniuse.com/#search=sticky](https://caniuse.com/#search=sticky)

### ES7 requirement
If your browser doesn't support ES7, please import [es7-shim](https://www.npmjs.com/package/es7-shim). Alternatively, you could just use the [polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes#Polyfill) for the Array `includes` method.

## Migrate `v0` to `v1`
For migration to `v0.1.x` to `v1.x.x` , `fixed: true` is equivalent to `fixed: left`, no need to change the value.

## Migrate `v1` to `v2`
v2 contain styles improvement. CSS-in-JS was removed, in order to let a full override style. However, you now must manually include css file

* inlude css file
  ```jsx
    import "react-table/react-table.css";
    ...
    import 'react-table-hoc-fixed-columns/lib/styles.css';
  ```
* `stripedColor` and `highlightColor` props was remove. You can now override it with pure css.
* See the [CSS file](https://github.com/GuillaumeJasmin/react-table-hoc-fixed-columns/blob/master/src/lib/styles.css) if you want to override style

## Contribute

Follow these steps to get started developing :

* `git clone https://github.com/guillaumejasmin/react-table-hoc-fixed-columns.git`
* `npm install`
* `npm run lib:watch` - Transpile the `src/lib` folder in watch mode
* `npm run demo` - start a development server with the demo website based on the `src/demo` folder.
* Go to http://127.0.0.1:8080 to see the demo in action. Whenever you change the code in either src/lib or src/demo, the page will automatically update.
