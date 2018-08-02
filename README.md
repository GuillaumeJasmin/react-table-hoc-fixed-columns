
ReactTable HOC fixed columns
---

Higher Order Components for [ReactTable](https://react-table.js.org). It make possible to fixed 1 or more columns.

[Demo here](https://guillaumejasmin.github.io/react-table-hoc-fixed-columns/)

## Try v1 beta

* [v1 demo](https://codesandbox.io/s/jnjv6j495y)
* [v1 docs](https://github.com/GuillaumeJasmin/react-table-hoc-fixed-columns/tree/next)
* [v1 release note](https://github.com/GuillaumeJasmin/react-table-hoc-fixed-columns/releases/tag/v1.0.0-beta.3)
---

## Config

```bash
npm install react-table-hoc-fixed-columns --save
```

It's really simple: add `fixed` property to your columns:


```js
import ReactTable from 'react-table';
import createTable from 'react-table-hoc-fixed-columns';
const ReactTableFixedColumns = createTable(ReactTable);
...
render () {
  return (
    <ReactTableFixedColumns
      data={data}
      columns={[
        {
          Header: 'First Name',
          accessor: 'firstName',
          fixed: true,
        },
        {
          Header: 'Last Name',
          accessor: 'lastName',
          fixed: true,
        },
        {
          Header: 'age',
          accessor: 'age',
        },
        {
          Header: 'other',
          columns: [
            ...
          ]
        },
      ]}
    />
  )
}
```

*Notes:*
  * It's a workaround, because the main `ReactTable` package currently not provide a way to have fixed columns. 
  * animation is not always smooth, it depend on your browser, OS, and scroll trigger (mouse wheel or scroll bar), but it works.
  * fixed columns must be placed a the index 0
  * fixed columns cannot be placed in a group
  * fixed columns are resizable
  * fixed columns must have a hardcoded `width`, by default it's 150 
  
   

## Table Ref

If you need to access ReactTable ref, use `innerRef`: 

```js
render () {
  return (
    <ReactTableFixedColumns
      innerRef={(ref) => { this.tableRef = ref; }}
    />
  )
}
```

## Dev

Follow these steps to get started developing :

* `git clone https://github.com/guillaumejasmin/react-table-hoc-fixed-columns.git`
* `npm install`
* `npm run lib:watch` - Transpile the `src/lib` folder in watch mode
* `npm run docs` - start a development server with the demo website based on the `src/docs` folder.
* Go to http://127.0.0.1:8181 to see the demo in action. Whenever you change the code in either src/lib or src/docs, the page will automatically update.
