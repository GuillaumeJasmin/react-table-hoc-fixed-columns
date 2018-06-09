import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { css } from 'emotion';

const fixedClassName = css`
  position: relative;
  z-Index: 2;
`;

const tableClassName = css`
  .-header .rt-th,
  .-filters .rt-th,
  .rt-td.${fixedClassName} {
    background-color: #fff;
  }

  .-headerGroups .rt-th {
    background-color: #f7f7f7;
  }

  .-header .rt-th {
    border-bottom: solid 1px #eee;
  }
`;

const lastFixedClassName = css`
  box-shadow: 2px 0px 4px #eee !important;
  border-right: solid 1px #ccc !important;
`;

const sortColumns = columns => columns.sort((a, b) => {
  if (a.fixed && !b.fixed) return -1;
  if (!a.fixed && b.fixed) return 1;
  return 0;
});

const getColumnsWithFixed = (columns, parentIsfixed, parentIsLastFixed) => columns.map((column, index) => {
  const fixed = column.fixed || parentIsfixed || false;
  const nextColumn = columns[index + 1];
  const _parentIsLastFixed = parentIsfixed === undefined && nextColumn && !nextColumn.fixed;
  const isLast = !nextColumn;
  return {
    ...column,
    fixed,
    className: cx(column.className, fixed && [fixedClassName], parentIsLastFixed && isLast && lastFixedClassName),
    headerClassName: cx(column.headerClassName, fixed && [fixedClassName], (_parentIsLastFixed || (parentIsLastFixed && isLast)) && lastFixedClassName),
    columns: column.columns && getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed),
  };
});

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      getTdProps: PropTypes.func,
      getProps: PropTypes.func,
      innerRef: PropTypes.func,
      className: PropTypes.string,
      onPageSizeChange: PropTypes.func,
    }

    static defaultProps = {
      getTdProps: null,
      getProps: null,
      innerRef: null,
      className: null,
      onPageSizeChange: null,
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
        this.prevScrollLeft = currentScrollLeft;
        this.updateLeftPos();
      }
    }

    onPageSizeChange = (...args) => {
      const { onPageSizeChange } = this.props;
      if (onPageSizeChange) {
        onPageSizeChange(...args);
      }
      this.updateLeftPos();
    }

    updateLeftPos() {
      document.querySelectorAll(`.${fixedClassName}`).forEach((td) => {
        /* eslint-disable no-param-reassign */
        td.style.left = `${this.prevScrollLeft}px`;
        /* eslint-enable no-param-reassign */
      });
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
      const { className, innerRef } = this.props;
      return (
        <ReactTable
          {...this.props}
          ref={innerRef}
          className={cx(className, tableClassName)}
          columns={this.getColumns()}
          getProps={this.getProps}
          onPageSizeChange={this.onPageSizeChange}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
