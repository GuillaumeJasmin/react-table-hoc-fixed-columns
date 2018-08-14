import React from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import cx from 'classnames';
import {
  getTableClassName,
  fixedClassName,
  fixedLeftClassName,
  fixedRightClassName,
} from './styles';
import {
  lastLeftFixedClassName,
  lastRightFixedClassName,
} from '../styles';
import { getColumnId, isLeftFixed, isRightFixed, sortColumns } from '../helpers';


export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      innerRef: PropTypes.func,
      className: PropTypes.string,
      onResizedChange: PropTypes.func,
      stripedColor: PropTypes.string,
    }

    static defaultProps = {
      innerRef: null,
      className: null,
      onResizedChange: null,
      stripedColor: null,
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

      this.columnsWidth = {};
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
        const id = getColumnId(column);
        const width = this.columnsWidth[id] || column.width || column.minWidth || 100;
        offset += width;
      }

      return offset;
    }

    getRightOffsetColumns(columns, index) {
      let offset = 0;
      for (let i = index + 1; i < columns.length - index; i += 1) {
        const column = columns[i];
        const id = getColumnId(column);
        const width = this.columnsWidth[id] || column.width || column.minWidth || 100;
        offset += width;
      }

      return offset;
    }

    getColumnsWithFixed(columns, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) {
      return columns.map((column, index) => {
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

        const columnIsLeftFixed = isLeftFixed({ fixed });
        const columnIsRightFixed = isRightFixed({ fixed });

        const left = columnIsLeftFixed && this.getLeftOffsetColumns(columns, index);
        const right = columnIsRightFixed && this.getRightOffsetColumns(columns, index);

        return {
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
          columns: column.columns && this.getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed, _parentIsFirstFixed),
        };
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
        className, innerRef, stripedColor, ...props
      } = this.props;

      const finalStripedColor = (className || '').indexOf('-striped') !== -1 ? '#f7f7f7' : stripedColor;

      return (
        <ReactTable
          {...props}
          ref={innerRef}
          className={cx(className, getTableClassName(finalStripedColor))}
          columns={this.getColumns()}
          onResizedChange={this.onResizedChange}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
