import React from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
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
  const _parentIsLastFixed = fixed && parentIsfixed === undefined && nextColumn && !nextColumn.fixed;
  const isLastFixed = fixed && (parentIsfixed ? [true, 'left'].includes(parentIsfixed) && parentIsLastFixed : true) && (
    (parentIsfixed && !nextColumn) ||
    (!parentIsfixed && nextColumn && !nextColumn.fixed)
  );

  const prevColumn = columns[index - 1];
  const _parentIsFirstFixed = fixed && parentIsfixed === undefined && prevColumn && !prevColumn.fixed;
  const isFirstFixed = fixed && (parentIsfixed ? parentIsfixed === 'right' && parentIsFirstFixed : true) && (
    (parentIsfixed && !prevColumn) ||
    (!parentIsfixed && prevColumn && !prevColumn.fixed)
  );

  return {
    ...column,
    fixed,
    className: cx(
      column.className,
      fixed && fixedClassName,
      isLeftFixed({ fixed }) && fixedLeftClassName,
      isRightFixed({ fixed }) && fixedRightClassName,
      isLastFixed && lastLeftFixedClassName,
      isFirstFixed && lastRightFixedClassName,
    ),
    headerClassName: cx(
      column.headerClassName,
      fixed && fixedClassName,
      isLeftFixed({ fixed }) && fixedLeftClassName,
      isRightFixed({ fixed }) && fixedRightClassName,
      (_parentIsLastFixed || (parentIsLastFixed && isLastFixed)) && lastLeftFixedClassName,
      (_parentIsFirstFixed || (parentIsFirstFixed && isFirstFixed)) && lastRightFixedClassName,
    ),
    columns: column.columns && getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed, _parentIsFirstFixed),
  };
});

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      getProps: PropTypes.func,
      innerRef: PropTypes.func,
      className: PropTypes.string,
      onPageChange: PropTypes.func,
      onResizedChange: PropTypes.func,
      onFilteredChange: PropTypes.func,
      onPageSizeChange: PropTypes.func,
      // onExpandedChange: PropTypes.func,
    }

    static defaultProps = {
      getProps: null,
      innerRef: null,
      className: null,
      onResizedChange: null,
      onFilteredChange: null,
      onPageChange: null,
      onPageSizeChange: null,
      // onExpandedChange: null,
    }

    constructor(props) {
      super(props);
      const hasGroups = !!props.columns.find(column => column.columns);
      this.tableDataId = `data-table-${uniqid()}`;
      const fixedColumnsWithoutGroup = props.columns.filter(column => column.fixed && !column.columns).map(({ Header }) => `'${Header}'`);
      if (hasGroups && fixedColumnsWithoutGroup.length) {
        console.warn([
          'WARNING react-table-hoc-fixed-column: ReactTable has fixed columns outside groups.',
          `For a better UI render, place ${fixedColumnsWithoutGroup.join(' and ')} columns into a group (even a group with an empty Header label)`,
        ].join('\n\n'));
      }

      this.onChangePropertyList = {
        onResizedChange: this.onChangeProperty('onResizedChange'),
        onFilteredChange: this.onChangeProperty('onFilteredChange'),
        onPageChange: this.onChangeProperty('onPageChange'),
        onPageSizeChange: this.onChangeProperty('onPageSizeChange'),
      };
    }

    componentDidMount() {
      this.tableRef = document.querySelector(`[${this.tableDataId}] .rt-table`);
      this.calculatePos();
      this.leftFixedCells = this.tableRef.querySelectorAll(`.${fixedLeftClassName}`);
      this.rightFixedCells = this.tableRef.querySelectorAll(`.${fixedRightClassName}`);
    }

    componentDidUpdate() {
      this.updatePos();
    }

    onScrollX = (event) => {
      if (event.nativeEvent.target.getAttribute('class') !== 'rt-table') return;
      this.calculatePos(event.nativeEvent.target);
    }

    calculatePos(target = this.tableRef) {
      const { scrollLeft, scrollWidth, offsetWidth } = target;
      this.nextTranslateLeftX = scrollLeft;
      this.nextTranslateRightX = scrollWidth - scrollLeft - offsetWidth;
      this.updatePos(target);
    }

    onResizedChange = (...args) => {
      const { onResizedChange } = this.props;
      if (onResizedChange) {
        onResizedChange(...args);
      }
      this.calculatePos();
    }

    onChangeProperty = propertyName => (...args) => {
      const propertyProps = this.props[propertyName];
      if (propertyProps) {
        propertyProps(...args);
      }
      this.updatePos();
    }

    // onExpandedChange = (...args) => {
    //   const { onExpandedChange } = this.props;
    //   if (onExpandedChange) {
    //     onExpandedChange(...args);
    //   }
    // }

    updatePos(target = this.tableRef) {
      /* eslint-disable no-param-reassign */
      target.querySelectorAll(`.${fixedLeftClassName}`).forEach((td) => {
        td.style.transform = `translate3d(${this.nextTranslateLeftX}px, 0, 0)`;
      });

      target.querySelectorAll(`.${fixedRightClassName}`).forEach((td) => {
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
        [this.tableDataId]: true,
      };
    }

    render() {
      const { className, innerRef, ...props } = this.props;
      return (
        <ReactTable
          {...props}
          ref={innerRef}
          className={cx(className, tableClassName)}
          columns={this.getColumns()}
          getProps={this.getProps}
          {...this.onChangePropertyList}
          // onExpandedChange={this.onExpandedChange}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
