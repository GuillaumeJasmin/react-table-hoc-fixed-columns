import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { css } from 'emotion';

const fixedLeftClassName = '__fixedLeftClassName';
const fixedRightClassName = '__fixedRightClassName';

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

const border = 'solid 1px #ccc !important';

const lastLeftFixedClassName = css`
  box-shadow: 2px 0px 4px #eee !important;
  border-right: ${border};
`;

const lastRightFixedClassName = css`
  box-shadow: -2px 0px 4px #eee !important;
  border-left: ${border};
`;

const isLeftFixed = column => [true, 'left'].includes(column.fixed);
const isRightFixed = column => column.fixed === 'right';

const sortColumns = columns => columns.sort((a, b) => {
  if (isLeftFixed(a) && !isLeftFixed(b)) return -1;
  if (!isLeftFixed(a) && isLeftFixed(b)) return 1;
  if (isRightFixed(a) && !isRightFixed(b)) return 1;
  if (!isRightFixed(a) && isRightFixed(b)) return -1;
  return 0;
});

const getColumnsWithFixed = (columns, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) => columns.map((column, index) => {
  const fixed = column.fixed || parentIsfixed || false;
  const nextColumn = columns[index + 1];
  const _parentIsLastFixed = parentIsfixed === undefined && nextColumn && !nextColumn.fixed;
  const isLast = !nextColumn;
  const prevColumn = columns[index - 1];
  const _parentIsFirstFixed = parentIsfixed === undefined && prevColumn && !prevColumn.fixed;
  const isFirst = !prevColumn;
  return {
    ...column,
    fixed,
    className: cx(
      column.className,
      fixed && fixedClassName,
      isLeftFixed({ fixed }) && fixedLeftClassName,
      isRightFixed({ fixed }) && fixedRightClassName,
      parentIsLastFixed && isLast && lastLeftFixedClassName,
      parentIsFirstFixed && isFirst && lastRightFixedClassName,
    ),
    headerClassName: cx(
      column.headerClassName,
      fixed && fixedClassName,
      isLeftFixed({ fixed }) && fixedLeftClassName,
      isRightFixed({ fixed }) && fixedRightClassName,
      (_parentIsLastFixed || (parentIsLastFixed && isLast)) && lastLeftFixedClassName,
      (_parentIsFirstFixed || (parentIsFirstFixed && isFirst)) && lastRightFixedClassName,
    ),
    columns: column.columns && getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed, _parentIsFirstFixed),
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
      onResizedChange: PropTypes.func,
    }

    static defaultProps = {
      getTdProps: null,
      getProps: null,
      innerRef: null,
      className: null,
      onPageSizeChange: null,
      onResizedChange: null,
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

    componentDidMount() {
      this.calculatePos(document.querySelector('.rt-table'));
      this.leftFixedCells = document.querySelectorAll(`.${fixedLeftClassName}`);
      this.rightFixedCells = document.querySelectorAll(`.${fixedRightClassName}`);
    }

    onScrollX = (event) => {
      if (event.nativeEvent.target.getAttribute('class') !== 'rt-table') return;
      this.calculatePos(event.nativeEvent.target);
    }

    calculatePos(target = document.querySelector('.rt-table')) {
      const { scrollLeft, scrollWidth, offsetWidth } = target;
      this.nextTranslateLeftX = scrollLeft;
      this.nextTranslateRightX = scrollWidth - scrollLeft - offsetWidth;
      this.updatePos();
    }

    onPageSizeChange = (...args) => {
      const { onPageSizeChange } = this.props;
      if (onPageSizeChange) {
        onPageSizeChange(...args);
      }
      this.updatePos();
    }

    onResizedChange = (...args) => {
      const { onResizedChange } = this.props;
      if (onResizedChange) {
        onResizedChange(...args);
      }
      this.calculatePos();
    }

    updatePos() {
      /* eslint-disable no-param-reassign */
      document.querySelectorAll(`.${fixedLeftClassName}`).forEach((td) => {
        td.style.transform = `translate3d(${this.nextTranslateLeftX}px, 0, 0)`;
      });

      document.querySelectorAll(`.${fixedRightClassName}`).forEach((td) => {
        td.style.transform = `translate3d(${-this.nextTranslateRightX}px, 0, 0)`;
      });
      /* eslint-enable no-param-reassign */
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
          onResizedChange={this.onResizedChange}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
