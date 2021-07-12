import React from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import cx from 'classnames';
import { isLeftFixed, isRightFixed, sortColumns, checkErrors, findPrevColumnNotHidden, findNextColumnNotHidden, memoize } from '../helpers';

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      getTableProps: PropTypes.func,
      innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
      className: PropTypes.string,
      uniqClassName: PropTypes.string,
      column: PropTypes.object,
    }

    static defaultProps = {
      getTableProps: null,
      innerRef: null,
      className: null,
      uniqClassName: null,
      column: ReactTable.defaultProps.column,
    }

    constructor(props) {
      super(props);

      checkErrors(this.props.columns);

      this.uniqClassName = this.props.uniqClassName || uniqid('rthfc-');

      this.onChangePropertyList = {
        onResizedChange: this.onChangeProperty('onResizedChange'),
        onFilteredChange: this.onChangeProperty('onFilteredChange'),
        onPageChange: this.onChangeProperty('onPageChange'),
        onPageSizeChange: this.onChangeProperty('onPageSizeChange'),
        onExpandedChange: this.onChangeProperty('onExpandedChange'),
      };
    }

    componentDidMount() {
      this.tableRef = document.querySelector(`.${this.uniqClassName} .rt-table`);
      this.calculatePos();
      this.leftFixedCells = this.tableRef.querySelectorAll(`.${this.uniqClassName} .rthfc-fixed-left`);
      this.rightFixedCells = this.tableRef.querySelectorAll(`.${this.uniqClassName} .rthfc-fixed-left`);
    }

    componentDidUpdate() {
      this.updatePos();
    }

    onScrollX = (event) => {
      if (event.currentTarget !== event.target) return;
      this.calculatePos(event.nativeEvent.target);
    }

    calculatePos(target = this.tableRef) {
      const { scrollLeft, scrollWidth, offsetWidth } = target;
      this.nextTranslateLeftX = scrollLeft;
      this.nextTranslateRightX = scrollWidth - scrollLeft - offsetWidth;
      this.updatePos(target);
    }

    onChangeProperty = propertyName => (...args) => {
      const propertyProps = this.props[propertyName];
      if (propertyProps) {
        propertyProps(...args);
      }
      this.calculatePos();
    }

    updatePos(target = this.tableRef) {
      /* eslint-disable no-param-reassign */
      Array.from(target.querySelectorAll('.rthfc-th-fixed-left, .rthfc-td-fixed-left')).forEach((td) => {
        td.style.transform = `translate3d(${this.nextTranslateLeftX}px, 0, 0)`;
      });

      Array.from(target.querySelectorAll('.rthfc-th-fixed-right, .rthfc-td-fixed-right')).forEach((td) => {
        td.style.transform = `translate3d(${-this.nextTranslateRightX}px, 0, 0)`;
      });
      /* eslint-enable no-param-reassign */
    }

    getColumnsWithFixedFeature = (columns, columnProps, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) => columns.map((column, index) => {
      const defaultColumn = columnProps;

      const fixed = column.fixed || parentIsfixed || false;

      const nextColumn = findNextColumnNotHidden(columns, index);
      const _parentIsLastFixed = fixed && parentIsfixed === undefined && nextColumn && !nextColumn.fixed;
      const isLastFixed = fixed && (parentIsfixed ? [true, 'left'].includes(parentIsfixed) && parentIsLastFixed : true) && (
        (parentIsfixed && !nextColumn) ||
        (!parentIsfixed && nextColumn && !nextColumn.fixed)
      );

      const prevColumn = findPrevColumnNotHidden(columns, index);
      const _parentIsFirstFixed = fixed && parentIsfixed === undefined && prevColumn && !prevColumn.fixed;
      const isFirstFixed = fixed && (parentIsfixed ? parentIsfixed === 'right' && parentIsFirstFixed : true) && (
        (parentIsfixed && !prevColumn) ||
        (!parentIsfixed && prevColumn && !prevColumn.fixed)
      );

      const output = {
        ...column,
        fixed,
        className: cx(
          defaultColumn.className,
          column.className,
          fixed && 'rthfc-td-fixed',
          isLeftFixed({ fixed }) && 'rthfc-td-fixed-left',
          isRightFixed({ fixed }) && 'rthfc-td-fixed-right',
          isLastFixed && 'rthfc-td-fixed-left-last',
          isFirstFixed && 'rthfc-td-fixed-right-first',
        ),
        headerClassName: cx(
          defaultColumn.headerClassName,
          column.headerClassName,
          fixed && 'rthfc-th-fixed',
          isLeftFixed({ fixed }) && 'rthfc-th-fixed-left',
          isRightFixed({ fixed }) && 'rthfc-th-fixed-right',
          (_parentIsLastFixed || (parentIsLastFixed && isLastFixed)) && 'rthfc-th-fixed-left-last',
          (_parentIsFirstFixed || (parentIsFirstFixed && isFirstFixed)) && 'rthfc-th-fixed-right-first',
        ),
      };

      if (column.columns) {
        output.columns = this.getColumnsWithFixedFeature(column.columns, columnProps, fixed, _parentIsLastFixed, _parentIsFirstFixed);
      }

      return output;
    });

    getColumns = memoize((columns, columnProps) => {
      const sortedColumns = sortColumns(columns);
      return this.getColumnsWithFixedFeature(sortedColumns, columnProps);
    })

    getTableProps = (...args) => {
      const { getTableProps } = this.props;
      return {
        ...(getTableProps && getTableProps(...args)),
        onScroll: this.onScrollX,
      };
    }

    render() {
      const {
        className,
        innerRef,
        columns,
        ...props
      } = this.props;

      return (
        <ReactTable
          {...props}
          ref={innerRef}
          className={cx(className, 'rthfc', '-se', this.uniqClassName)}
          columns={this.getColumns(columns, this.props.column)}
          getTableProps={this.getTableProps}
          {...this.onChangePropertyList}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
