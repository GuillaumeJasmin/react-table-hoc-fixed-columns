import React from 'react';
import { render } from 'react-dom';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import withFixedColumns, { withFixedColumnsScrollEvent } from '../../lib';
import '../../lib/styles.css';
import './styles.css';
import {
  getFirstName,
  getLastName,
  getAge,
  getEmail,
  getStreet,
  getCity,
  // mathsRandomInt,
} from '../../src/FakeData.js';

const ReactTableFixedColumns = withFixedColumns(ReactTable);
const ReactTableFixedColumnsScrollEvent = withFixedColumnsScrollEvent(ReactTable);

const columns = [
  {
    Header: 'First Name',
    accessor: 'firstName',
    width: 150,
    fixed: 'left',
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
    width: 150,
    fixed: 'left',
  },
  {
    Header: 'Age',
    accessor: 'age',
    width: 150,
    fixed: 'right',
  },
  {
    Header: 'Email',
    accessor: 'email',
    width: 300,
  },
  {
    Header: 'Professional Email',
    accessor: 'proEmail',
    width: 300,
  },
  {
    Header: 'Street',
    accessor: 'street',
    width: 300,
  },
  {
    Header: 'Street bis',
    accessor: 'streetBis',
    width: 300,
  },
  {
    Header: 'City',
    accessor: 'city',
  },
];

const groupedColumns = [
  {
    fixed: 'left',
    columns: [
      {
        Header: 'First Name',
        accessor: 'firstName',
        width: 150,
        Footer: () => <div>Footer</div>,
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        width: 150,
      },
    ],
  },
  {
    Header: 'Other Infos',
    columns: [
      {
        Header: 'Full name',
        id: 'Full Name',
        width: 150,
        Cell: row => <div>{row.original.firstName}<br />{row.original.lastName}</div>,
        Footer: () => <div>Footer</div>,
      },
      {
        Header: 'Age',
        accessor: 'age',
      },
    ],
  },
  {
    Header: 'Location',
    columns: [
      {
        Header: 'Street',
        accessor: 'street',
        width: 300,
      },
      {
        Header: 'Street bis',
        accessor: 'streetBis',
        width: 300,
      },
      {
        Header: 'City',
        accessor: 'city',
      },
    ],
  },
  {
    fixed: 'right',
    columns: [
      {
        Header: 'Professional Email',
        accessor: 'proEmail',
        width: 200,
      },
      {
        Header: 'Email',
        accessor: 'email',
        width: 200,
      },
    ],
  },
];

const getData = () => {
  const data = [];
  for (let i = 0; i < 120; i += 1) {
    // const lastNameCount = mathsRandomInt(1, 3);
    // let lastName = Array.apply(null, Array(lastNameCount)); // eslint-disable-line
    // lastName = lastName.map((_, index) => ({
    //   id: index,
    //   value: getLastName(),
    // }));

    data.push({
      firstName: getFirstName(),
      lastName: getLastName(),
      age: getAge(),
      email: getEmail(),
      proEmail: getEmail(),
      street: getStreet(),
      streetBis: getStreet(),
      city: getCity(),
    });
  }
  return data;
};

const getTdProps = () => ({ style: { textAlign: 'center' } });

function Demo() {
  return (
    <div className="container">
      <div className="info">
        <div className="title">
          ReactTable HOC fixed columns
        </div>
        <div>
          <a href="https://github.com/guillaumejasmin/react-table-hoc-fixed-columns">Github source</a>
        </div>
      </div>

      <div>
        {/* Basic */}
        <div className="table">
          <ReactTableFixedColumns
            data={getData()}
            getTdProps={getTdProps}
            filterable
            columns={columns}
            defaultPageSize={50}
            className="-striped -highlight"
          />
        </div>

        {/* Grouped Columns */}
        <div className="table">
          <ReactTableFixedColumns
            data={getData()}
            getTdProps={getTdProps}
            filterable
            columns={groupedColumns}
            defaultPageSize={50}
            className="-striped"
          />
        </div>

        {/* Scroll Event */}
        <div className="table">
          <ReactTableFixedColumnsScrollEvent
            data={getData()}
            getTdProps={getTdProps}
            filterable
            columns={columns}
            defaultPageSize={50}
            className="-striped -highlight"
          />
        </div>

        {/* Grouped Columns & Scroll Event */}
        <div className="table">
          <ReactTableFixedColumnsScrollEvent
            data={getData()}
            getTdProps={getTdProps}
            filterable
            columns={groupedColumns}
            defaultPageSize={50}
            className="-striped"
          />
        </div>
      </div>
    </div>
  );
}

render(<Demo />, document.getElementById('app'));
