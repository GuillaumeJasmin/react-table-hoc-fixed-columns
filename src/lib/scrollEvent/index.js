import React from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import cx from 'classnames';
import { fixedClassName } from './styles';
import {
  getTableClassName,
  lastLeftFixedClassName,
  lastRightFixedClassName,
} from '../styles';
import { isLeftFixed, isRightFixed, sortColumns, findPrevColumnNotHidden, findNextColumnNotHidden } from '../helpers';

export default (ReactTable) => {
  class ReactTableFixedColumns extends React.Component {
    static propTypes = {
      columns: PropTypes.array.isRequired,
      getProps: PropTypes.func,
      innerRef: PropTypes.func,
      className: PropTypes.string,
      stripedColor: PropTypes.string,
      highlightColor: PropTypes.string,
    }

    static defaultProps = {
      getProps: null,
      innerRef: null,
      className: null,
      stripedColor: null,
      highlightColor: null,
    }

    constructor(props) {
      super(props);
      const hasGroups = !!props.columns.find(column => column.columns);
      this.tableDataId = `data-table-${uniqid('rthfc-')}`;
      const fixedColumnsWithoutGroup = props.columns.filter(column => column.fixed && !column.columns).map(({ Header }) => `'${Header}'`);
      if (hasGroups && fixedColumnsWithoutGroup.length) {
        console.warn([
          'WARNING react-table-hoc-fixed-column: ReactTable has fixed columns outside groups.',
          `For a better UI render, place ${fixedColumnsWithoutGroup.join(' and ')} columns into a group (even a group with an empty Header label)`,
        ].join('\n\n'));
      }

      this.fixedLeftClassName = uniqid('rthfc-');
      this.fixedRightClassName = uniqid('rthfc-');

      this.onChangePropertyList = {
        onResizedChange: this.onChangeProperty('onResizedChange'),
        onFilteredChange: this.onChangeProperty('onFilteredChange'),
        onPageChange: this.onChangeProperty('onPageChange'),
        onPageSizeChange: this.onChangeProperty('onPageSizeChange'),
        onExpandedChange: this.onChangeProperty('onExpandedChange'),
      };
    }

    componentDidMount() {
      this.tableRef = document.querySelector(`[${this.tableDataId}] .rt-table`);
      this.calculatePos();
      this.leftFixedCells = this.tableRef.querySelectorAll(`.${this.fixedLeftClassName}`);
      this.rightFixedCells = this.tableRef.querySelectorAll(`.${this.fixedRightClassName}`);
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

    onChangeProperty = propertyName => (...args) => {
      const propertyProps = this.props[propertyName];
      if (propertyProps) {
        propertyProps(...args);
      }
      this.calculatePos();
    }

    updatePos(target = this.tableRef) {
      /* eslint-disable no-param-reassign */
      Array.from(target.querySelectorAll(`.${this.fixedLeftClassName}`)).forEach((td) => {
        td.style.transform = `translate3d(${this.nextTranslateLeftX}px, 0, 0)`;
      });

      Array.from(target.querySelectorAll(`.${this.fixedRightClassName}`)).forEach((td) => {
        td.style.transform = `translate3d(${-this.nextTranslateRightX}px, 0, 0)`;
      });
      /* eslint-enable no-param-reassign */
    }

    getColumnsWithFixed = (columns, parentIsfixed, parentIsLastFixed, parentIsFirstFixed) => columns.map((column, index) => {
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
          column.className,
          fixed && fixedClassName,
          isLeftFixed({ fixed }) && this.fixedLeftClassName,
          isRightFixed({ fixed }) && this.fixedRightClassName,
          isLastFixed && lastLeftFixedClassName,
          isFirstFixed && lastRightFixedClassName,
        ),
        headerClassName: cx(
          column.headerClassName,
          fixed && fixedClassName,
          isLeftFixed({ fixed }) && this.fixedLeftClassName,
          isRightFixed({ fixed }) && this.fixedRightClassName,
          (_parentIsLastFixed || (parentIsLastFixed && isLastFixed)) && lastLeftFixedClassName,
          (_parentIsFirstFixed || (parentIsFirstFixed && isFirstFixed)) && lastRightFixedClassName,
        ),
      };

      if (column.columns) {
        output.columns = this.getColumnsWithFixed(column.columns, fixed, _parentIsLastFixed, _parentIsFirstFixed);
      }

      return output;
    });

    getColumns() {
      const { columns } = this.props;
      const sortedColumns = sortColumns(columns);
      const columnsWithFixed = this.getColumnsWithFixed(sortedColumns);
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
          className={cx(className, getTableClassName(this.props))}
          columns={this.getColumns()}
          getProps={this.getProps}
          {...this.onChangePropertyList}
        />
      );
    }
  }

  return ReactTableFixedColumns;
};
