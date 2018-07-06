
ReactTable HOC fixed columns - Beta
---

Higher Order Components for [ReactTable](https://react-table.js.org). It make possible to fixed one or more columns on the left and/or on the right.

[Demo on CodeSandbox here](https://codesandbox.io/s/jnjv6j495y)

## Config

```bash
npm install react-table-hoc-fixed-columns@next --save
```

It's really simple: add `fixed` property to your columns with value `left` and `right`

*Note:* for migration to `v0.1.x` to `v1.x.x` , `fixed: true` is equivalent to `fixed: left`, no need to change the value.


```js
import ReactTable from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';
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
import withFixedColumns from 'react-table-hoc-fixed-columns';
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



*Notes:*
  * It's a workaround, because the main `ReactTable` package currently not provide a way to have fixed columns. 
  * animation is not always smooth, it depend on your browser, OS, and scroll trigger (mouse wheel or scroll bar), but it works.
  * fixed columns works on simple column or groups
  * fixed columns are resizable
  * works with differents cell height
  
   

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
