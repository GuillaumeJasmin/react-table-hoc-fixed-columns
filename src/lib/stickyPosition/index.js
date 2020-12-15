import React from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import cx from 'classnames';
import { getColumnId, isLeftFixed, isRightFixed, sortColumns, checkErrors, findPrevColumnNotHidden, findNextColumnNotHidden, memoize } from '../helpers';

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
      className: PropTypes.string,
      onResizedChange: PropTypes.func,
      uniqClassName: PropTypes.string,
      column: PropTypes.object,
      selectWidth: PropTypes.number,
      isSelectTable: PropTypes.bool,
    }

    static defaultProps = {
      innerRef: null,
      className: null,
      onResizedChange: null,
      uniqClassName: null,
      column: ReactTable.defaultProps.column,
      isSelectTable: false,
    }

    static getLeftOffsetColumns(columns, index, columnsWidth, isSelectTable, selectWidth) {
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        const column = columns[i];
        if (column.show !== false) {
          const id = getColumnId(column);
          const width = columnsWidth[id] || column.width || column.minWidth || 100;
          offset += width;
        }
      }
      if (isSelectTable) {
        offset += selectWidth || 30;
      }

      return offset;
    }

    static getRightOffsetColumns(columns, index, columnsWidth) {
      let offset = 0;
      for (let i = index + 1; i < columns.length; i += 1) {
        const column = columns[i];
        if (column.show !== false) {
          const id = getColumnId(column);
          const width = columnsWidth[id] || column.width || column.minWidth || 100;
          offset += width;
        }
      }

      return offset;
    }

    constructor(props) {
      super(props);

      checkErrors(this.props.columns);

      this.uniqClassName = this.props.uniqClassName || uniqid('rthfc-');

      this.state = {
        columnsWidth: {},
      };
    }

    componentDidMount() {
      this.updateRowsPosition();
    }

    componentDidUpdate() {
      this.updateRowsPosition();
    }

    updateRowsPosition() {
      const headerRows = document.querySelectorAll(`.${this.uniqClassName} .rt-thead`);
      let topPosition = 0;
      /* eslint-disable no-param-reassign */
      Array.from(headerRows).forEach((row) => {
        row.style.top = `${topPosition}px`;
        topPosition += row.offsetHeight;
      });
      /* eslint-enable no-param-reassign */
    }

    onResizedChange = (...args) => {
      const { onResizedChange } = this.props;
      if (onResizedChange) {
        onResizedChange(...args);
      }

      args[0].forEach(({ id, value }) => {
        this.setState(prevState => ({
          columnsWidth: {
            ...prevState.columnsWidth,
            [id]: value,
          },
        }));
      });
    }

    getColumnsWithFixedFeature(columns, columnProps, columnsWidth, isSelectTable, selectWidth, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) {
      const defaultColumn = columnProps || {};

      return columns.map((column, index) => {
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

        const columnIsLeftFixed = isLeftFixed({ fixed });
        const columnIsRightFixed = isRightFixed({ fixed });

        const left = columnIsLeftFixed && ReactTableFixedColumns.getLeftOffsetColumns(columns, index, columnsWidth, isSelectTable, selectWidth);
        const right = columnIsRightFixed && ReactTableFixedColumns.getRightOffsetColumns(columns, index, columnsWidth);

        const output = {
          ...column,
          fixed,
          className: cx(
            defaultColumn.className,
            column.className,
            fixed && 'rthfc-td-fixed',
            columnIsLeftFixed && 'rthfc-td-fixed-left',
            columnIsRightFixed && 'rthfc-td-fixed-right',
            isLastFixed && 'rthfc-td-fixed-left-last',
            isFirstFixed && 'rthfc-td-fixed-right-first',
          ),
          style: {
            ...defaultColumn.style,
            ...column.style,
            left,
            right,
          },
          headerClassName: cx(
            defaultColumn.headerClassName,
            column.headerClassName,
            fixed && 'rthfc-th-fixed',
            columnIsLeftFixed && 'rthfc-th-fixed-left',
            columnIsRightFixed && 'rthfc-th-fixed-right',
            (_parentIsLastFixed || (parentIsLastFixed && isLastFixed)) && 'rthfc-th-fixed-left-last',
            (_parentIsFirstFixed || (parentIsFirstFixed && isFirstFixed)) && 'rthfc-th-fixed-right-first',
          ),
          headerStyle: {
            ...defaultColumn.headerStyle,
            ...column.headerStyle,
            left,
            right,
          },
        };

        if (column.columns) {
          output.columns = this.getColumnsWithFixedFeature(column.columns, columnProps, columnsWidth, isSelectTable, selectWidth, fixed, _parentIsLastFixed, _parentIsFirstFixed);
        }

        return output;
      });
    }

    getColumns = memoize((columns, columnProps, columnsWidth, isSelectTable, selectWidth) => {
      const sortedColumns = sortColumns(columns);
      return this.getColumnsWithFixedFeature(sortedColumns, columnProps, columnsWidth, isSelectTable, selectWidth);
    })

    render() {
      const {
        className,
        innerRef,
        columns,
        selectWidth,
        isSelectTable,
        ...props
      } = this.props;

      return (
        <ReactTable
          {...props}
          ref={innerRef}
          className={cx(className, this.uniqClassName, 'rthfc', '-sp', { 'select-table': isSelectTable })}
          columns={this.getColumns(columns, this.props.column, this.state.columnsWidth, isSelectTable, selectWidth)}
          onResizedChange={this.onResizedChange}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
