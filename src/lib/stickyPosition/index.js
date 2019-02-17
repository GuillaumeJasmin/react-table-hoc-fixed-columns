import React from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import cx from 'classnames';
import {
  tableClassName,
  fixedClassName,
  fixedLeftClassName,
  fixedRightClassName,
} from './styles';
import {
  getTableClassName,
  lastLeftFixedClassName,
  lastRightFixedClassName,
} from '../styles';
import { getColumnId, isLeftFixed, isRightFixed, sortColumns, findPrevColumnNotHidden, findNextColumnNotHidden } from '../helpers';


export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
      className: PropTypes.string,
      onResizedChange: PropTypes.func,
      stripedColor: PropTypes.string,
      highlightColor: PropTypes.string,
    }

    static defaultProps = {
      innerRef: null,
      className: null,
      onResizedChange: null,
      stripedColor: null,
      highlightColor: null,
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

      this.tableClassName = getTableClassName(this.props);
      this.columnsWidth = {};
      this.uniqClassName = uniqid('rthfc-');
    }

    componentDidMount() {
      const headerRows = document.querySelectorAll(`.${this.uniqClassName} .rt-thead`);
      /* eslint-disable no-param-reassign */
      Array.from(headerRows).forEach((row) => {
        row.style.top = `${row.offsetTop}px`;
      });
      /* eslint-enable no-param-reassign */
    }

    onResizedChange = (...args) => {
      const { onResizedChange } = this.props;
      if (onResizedChange) {
        onResizedChange(...args);
      }

      args[0].forEach(({ id, value }) => {
        this.columnsWidth[id] = value;
      });

      this.forceUpdate();
    }

    getLeftOffsetColumns(columns, index) {
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        const column = columns[i];
        if (column.show !== false) {
          const id = getColumnId(column);
          const width = this.columnsWidth[id] || column.width || column.minWidth || 100;
          offset += width;
        }
      }

      return offset;
    }

    getRightOffsetColumns(columns, index) {
      let offset = 0;
      for (let i = index + 1; i < columns.length; i += 1) {
        const column = columns[i];
        if (column.show !== false) {
          const id = getColumnId(column);
          const width = this.columnsWidth[id] || column.width || column.minWidth || 100;
          offset += width;
        }
      }

      return offset;
    }

    getColumnsWithFixed(columns, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) {
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

        const left = columnIsLeftFixed && this.getLeftOffsetColumns(columns, index);
        const right = columnIsRightFixed && this.getRightOffsetColumns(columns, index);

        const output = {
          ...column,
          fixed,
          className: cx(
            column.className,
            fixed && fixedClassName,
            columnIsLeftFixed && fixedLeftClassName,
            columnIsRightFixed && fixedRightClassName,
            isLastFixed && lastLeftFixedClassName,
            isFirstFixed && lastRightFixedClassName,
          ),
          style: {
            ...column.style,
            left,
            right,
          },
          headerClassName: cx(
            column.headerClassName,
            fixed && fixedClassName,
            columnIsLeftFixed && fixedLeftClassName,
            columnIsRightFixed && fixedRightClassName,
            (_parentIsLastFixed || (parentIsLastFixed && isLastFixed)) && lastLeftFixedClassName,
            (_parentIsFirstFixed || (parentIsFirstFixed && isFirstFixed)) && lastRightFixedClassName,
          ),
          headerStyle: {
            ...column.headerStyle,
            left,
            right,
          },
        };

        if (column.columns) {
          output.columns = this.getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed, _parentIsFirstFixed);
        }

        return output;
      });
    }

    getColumns() {
      const { columns } = this.props;
      const sortedColumns = sortColumns(columns);
      const columnsWithFixed = this.getColumnsWithFixed(sortedColumns);
      return columnsWithFixed;
    }

    render() {
      const {
        className,
        innerRef,
        stripedColor,
        highlightColor,
        ...props
      } = this.props;

      return (
        <ReactTable
          {...props}
          ref={innerRef}
          className={cx(className, this.tableClassName, tableClassName, this.uniqClassName)}
          columns={this.getColumns()}
          onResizedChange={this.onResizedChange}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
