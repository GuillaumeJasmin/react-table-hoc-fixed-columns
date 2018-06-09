import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { css } from 'emotion';

const fixedClassName = css`
  position: relative;
  z-Index: 2;
  box-shadow: 2px 0px 3px #ccc !important;
`;

const tableClassName = css`
  .-header .${fixedClassName},
  .rt-td.${fixedClassName} {
    background-color: #fff;
  }
`;

const sortColumns = columns => columns.sort((a, b) => {
  if (a.fixed && !b.fixed) return -1;
  if (!a.fixed && b.fixed) return 1;
  return 0;
});

const getColumnsWithFixed = (columns, parentIsfixed = false) => columns.map((column) => {
  const fixed = column.fixed || parentIsfixed;
  return {
    ...column,
    fixed,
    className: cx(column.className, fixed && [fixedClassName]),
    headerClassName: cx(column.headerClassName, fixed && [fixedClassName]),
    columns: column.columns && getColumnsWithFixed(column.columns, fixed),
  };
});

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      getTdProps: PropTypes.func,
      getProps: PropTypes.func,
      forwardedRef: PropTypes.func,
      className: PropTypes.string,
    }

    static defaultProps = {
      getTdProps: null,
      getProps: null,
      forwardedRef: null,
      className: null,
    }

    constructor(props) {
      super(props);
      const hasGroups = !!props.columns.find(column => column.columns);
      const fixedColumnsWithoutGroup = props.columns.filter(column => column.fixed && !column.columns).map(({ Header }) => `'${Header}'`);
      if (hasGroups && fixedColumnsWithoutGroup.length) {
        console.warn([
          'WARNING react-table-hoc-fixed-column: ReactTable has fixed columns outside groups.',
          `For a better UI render, place ${fixedColumnsWithoutGroup.join(' and ')} columns into a group (even a group with an empty Header label)`,
        ].join('\n\n'));
      }
    }

    onScrollX = (event) => {
      if (event.nativeEvent.target.getAttribute('class') !== 'rt-table') return;
      const currentScrollLeft = event.nativeEvent.target.scrollLeft;
      if (currentScrollLeft !== this.prevScrollLeft) {
        document.querySelectorAll(`.${fixedClassName}`).forEach((td) => {
          /* eslint-disable no-param-reassign */
          td.style.left = `${currentScrollLeft}px`;
          /* eslint-enable no-param-reassign */
        });
      }
    }

    getColumns() {
      const { columns } = this.props;
      const sortedColumns = sortColumns(columns);
      const columnsWithFixed = getColumnsWithFixed(sortedColumns);
      return columnsWithFixed;
    }

    getProps = (...args) => {
      const { getProps } = this.props;
      return {
        ...(getProps && getProps(...args)),
        onScroll: this.onScrollX,
      };
    }

    render() {
      const { className, forwardedRef } = this.props;
      return (
        <ReactTable
          {...this.props}
          className={cx(className, tableClassName)}
          ref={forwardedRef}
          columns={this.getColumns()}
          getProps={this.getProps}
        />
      );
    }
  }

  return React.forwardRef((props, ref) => <ReactTableFixedColumns {...props} forwardedRef={ref} />);
};
