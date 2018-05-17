import React from 'react';
import { render } from 'react-dom';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import createTable from '../../lib';
import './styles.css';
import {
  getFirstName,
  getLastName,
  getAge,
  getEmail,
  getStreet,
  getCity,
} from '../../src/FakeData.js';

const ReactTableFixedColumns = createTable(ReactTable);

const getData = () => {
  const data = [];
  for (let i = 0; i < 100; i += 1) {
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
          innerRef={(c) => { console.log('c', c); }}
          data={getData()}
          getTdProps={() => ({ style: { textAlign: 'center' } })}
          filterable
          columns={[
            {
              Header: '__GROUP__',
              fixed: true,
              columns: [
                {
                  Header: 'First Name',
                  accessor: 'firstName',
                  fixed: true,
                  width: 150,
                },
                {
                  Header: 'Last Name',
                  accessor: 'lastName',
                  fixed: true,
                  width: 150,
                },
              ],
            },
            {
              Header: '__GROUP2__',
              fixed: true,
              columns: [
                {
                  Header: 'First Name',
                  id: 'firstName 2',
                  accessor: 'firstName',
                  fixed: true,
                  width: 150,
                },
                {
                  Header: 'Last Name',
                  id: 'lastName 2',
                  accessor: 'lastName',
                  fixed: true,
                  width: 150,
                },
              ],
            },
            // {
            //   Header: 'First Name',
            //   accessor: 'firstName',
            //   fixed: true,
            // },
            // {
            //   Header: 'Last Name',
            //   accessor: 'lastName',
            //   fixed: true,
            // },
            {
              Header: 'Other infos',
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
              ],
            },
          ]}
          defaultPageSize={50}
        />
      </div>
    </div>
  );
}

render(<Demo />, document.getElementById('app'));
