import React from 'react';
import { render } from 'react-dom';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { withFixedColumns, withFixedColumnsOldSupport } from '../../lib';
import './styles.css';
import {
  getFirstName,
  getLastName,
  getAge,
  getEmail,
  getStreet,
  getCity,
  mathsRandomInt,
} from '../../src/FakeData.js';

const ReactTableFixedColumns = withFixedColumns(ReactTable);
// const ReactTableFixedColumns = withFixedColumnsOldSupport(ReactTable);

const getData = () => {
  const data = [];
  for (let i = 0; i < 100; i += 1) {
    const lastNameCount = mathsRandomInt(1, 3);
    let lastName = Array.apply(null, Array(lastNameCount)); // eslint-disable-line
    lastName = lastName.map((_, index) => ({
      id: index,
      value: getLastName(),
    }));

    data.push({
      firstName: getFirstName(),
      lastName,
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
      <div className="table">
        <ReactTableFixedColumns
          data={getData()}
          getTdProps={() => ({ style: { textAlign: 'center' } })}
          filterable
          columns={[
                {
                  fixed: true,
                  columns: [
                    {
                      Header: 'First Name',
                      accessor: 'firstName',
                      width: 150,
                      fixed: true,
                    },
                  ],
                },
                // {
                //   Header: 'Last Name',
                //   accessor: 'lastName',
                //   width: 150,
                //   Cell: row => <div>{row.value.map(item => <div key={item.id}>{item.value}</div>)}</div>,
                //   fixed: true,
                // },
                {
                  Header: 'A',
                  columns: [
                    {
                      Header: 'Age',
                      accessor: 'age',
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
                  ]
                }
          ]}
          defaultPageSize={50}
        />
      </div>
    </div>
  );
}

render(<Demo />, document.getElementById('app'));
