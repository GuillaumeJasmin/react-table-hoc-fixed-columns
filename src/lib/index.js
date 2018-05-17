import React from 'react';
import PropTypes from 'prop-types';

const getFixedColumnId = id => `__fixedHidden__${id}`;
const getColumnId = column => column.id || column.accessor || column.Header;
const ghostGroupId = '__ghost__group__id__';

const styleFixedVisible = {
  position: 'absolute',
  height: '100%',
  backgroundColor: '#fff',
  zIndex: 3,
  boxShadow: '2px 0px 5px #ddd',
};

export default ReactTable => class ReactTableFixedColumns extends React.Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    getTdProps: PropTypes.func,
    getTheadThProps: PropTypes.func,
    getProps: PropTypes.func,
    innerRef: PropTypes.func,
    loading: PropTypes.bool,
  }

  static defaultProps = {
    getTdProps: () => ({}),
    getTheadThProps: () => ({}),
    getProps: () => ({}),
    innerRef: null,
    loading: false,
  }

  static preparedColumns(columns) {
    return columns.map(column => ({
      ...column,
      width: column.fixed ? (column.width || 150) : column.width,
    }));
  }

  static getHeaderGhost() {
    return document.querySelector('.rt-thead.-headerGroups .rt-tr .rt-th');
  }

  static hasFixedColumns = (columns) => {
    let hasFixedColumns = !!columns.find(({ fixed }) => fixed === true);
    columns.forEach((column) => {
      if (!hasFixedColumns && column.columns && column.columns.find(({ fixed }) => fixed === true)) {
        hasFixedColumns = true;
      }
    });
    return hasFixedColumns;
  }

  constructor(props) {
    super(props);
    this.hasFixedColumns = ReactTableFixedColumns.hasFixedColumns(props.columns);
    this.hasGroups = props.columns.find(({ columns }) => columns && columns.length > 0);
  }

  state = {
    resized: [],
  }

  fixedColumns = [];

  componentDidMount() {
    if (this.hasFixedColumns) {
      this.updateHeaderEmptyColWidth();
      this.calculateOffsetLeft();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading && !this.props.loading) {
      this.updateHeaderEmptyColWidth();
    }
  }

  updateHeaderEmptyColWidth() {
    const $offsetEl = ReactTableFixedColumns.getHeaderGhost();
    if (this.hasFixedColumns && $offsetEl) {
      // const width = Array.from(document.querySelectorAll('.rt-thead.-header [data-fixedvisible="true"]'))
      //   .map($el => $el.offsetWidth)
      //   .reduce((a, b) => a + b, 0);
      // $offsetEl.style.marginLeft = `-${width}px`;
      // $offsetEl.style.paddingLeft = `${width}px`;
    }
  }

  updateLeftPos(currentScrollLeft = this.prevScrollLeft || 0) {
    Array.from(document.querySelectorAll('[data-fixedvisible="true"]')).forEach(($el) => {
      const colId = $el.getAttribute('data-colid');
      const { offsetLeft } = this.fixedColumns.find(({ id }) => id === colId);
      const left = offsetLeft + currentScrollLeft;
      $el.style.left = `${left}px`; // eslint-disable-line
    });
    this.prevScrollLeft = currentScrollLeft;
  }

  onScrollX = (event) => {
    if (event.nativeEvent.target.getAttribute('class') !== 'rt-table') return;
    const currentScrollLeft = event.nativeEvent.target.scrollLeft;
    if (currentScrollLeft !== this.prevScrollLeft) {
      this.updateLeftPos(currentScrollLeft);
    }
  }

  onResizeChange = (resized) => {
    const nextResized = resized.slice();
    this.fixedColumns.forEach(({ id }) => {
      const fixedColumnsResized = nextResized.find(resizedItem => resizedItem.id === id);
      const fixedColumnsHiddenIndex = nextResized.findIndex(resizedItem => resizedItem.id === getFixedColumnId(id));
      if (fixedColumnsResized) {
        if (fixedColumnsHiddenIndex !== -1) {
          nextResized[fixedColumnsHiddenIndex].value = fixedColumnsResized.value;
        } else {
          nextResized.push({
            id: getFixedColumnId(id),
            value: fixedColumnsResized.value,
          });
        }
      }
    });

    this.setState({ resized: nextResized }, () => {
      nextResized.forEach((item) => {
        const fixedColumn = this.fixedColumns.find(({ id }) => id === item.id);
        if (fixedColumn) {
          fixedColumn.width = item.value;
        }
      });
      this.updateHeaderEmptyColWidth();
      this.calculateOffsetLeft();
      this.updateLeftPos();
    });
  }

  calculateOffsetLeft() {
    const fixedColumnsNoGroup = this.fixedColumns.filter(({ isGroup }) => !isGroup);
    const fixedColumnsGroup = this.fixedColumns.filter(({ isGroup }) => isGroup);

    for (let i = 0; i < fixedColumnsNoGroup.length; i += 1) {
      if (i > 0) {
        const prev = fixedColumnsNoGroup[i - 1];
        fixedColumnsNoGroup[i].offsetLeft = prev.offsetLeft + prev.width;
      }
    }

    for (let i = 0; i < fixedColumnsGroup.length; i += 1) {
      if (i > 0) {
        const prev = fixedColumnsGroup[i - 1];
        fixedColumnsGroup[i].offsetLeft = prev.offsetLeft + prev.width;
      }
    }
  }

  mergeProps = (propsKey, args, nextProps) => {
    const getProps = this.props[propsKey];
    const prevProps = (getProps && getProps(...args)) || {};
    return {
      ...prevProps,
      ...nextProps,
      style: {
        ...prevProps.style,
        ...nextProps.style,
      },
    };
  }

  processColumns(columns, isRoot = true, firstFixedGroups = []) {
    // let columnFixedOffset = 0;
    // let columnGroupFixedOffset = 0;

    const nextFirstFixedGroups = firstFixedGroups;

    // const firstFixedGroups = [];

    const outputColumns = columns
      .map((column) => {
        const isGroup = column.columns && column.columns.length > 1;
        const nextColumn = {
          ...column,
          isGroup,
          columns: isGroup && this.processColumns(column.columns, false, nextFirstFixedGroups),
        };

        const columnId = getColumnId(nextColumn);
        if (nextColumn.fixed) {
          nextFirstFixedGroups.push({
            ...nextColumn,
            width: nextColumn.width || 200,
            __fixedHidden: true,
            id: getFixedColumnId(columnId),
          });

          const output = [
            {
              ...nextColumn,
              width: nextColumn.width || 200,
              __fixedVisible: true,
              __extraTdPropsStyle: {
                left: isGroup ? this.columnGroupFixedOffset : this.columnFixedOffset,
              },
            },
          ];

          // const output = [
          //   {
          //     ...nextColumn,
          //     width: nextColumn.width || 200,
          //     __fixedVisible: true,
          //     __extraTdPropsStyle: {
          //       left: this.columnFixedOffset,
          //     },
          //   },
          //   {
          //     ...nextColumn,
          //     width: nextColumn.width || 200,
          //     __fixedHidden: true,
          //     id: getFixedColumnId(columnId),
          //   },
          // ];

          if (!this.fixedColumns.find(({ id }) => id === columnId)) {
            this.fixedColumns.push({
              id: columnId,
              width: nextColumn.width,
              offsetLeft: isGroup ? this.columnGroupFixedOffset : this.columnFixedOffset,
              isGroup,
            });
          }

          if (isGroup) {
            // this.columnGroupFixedOffset += nextColumn.width || 0;
            this.columnGroupFixedOffset = this.columnFixedOffset;
          } else {
            this.columnFixedOffset += nextColumn.width || 0;
          }

          return output;
        }

        return [nextColumn];
      })
      .reduce((a, b) => [...a, ...b], []);

    if (isRoot) {
      return [
        ...firstFixedGroups,
        ...outputColumns,
      ];
    }

    return outputColumns;
  }

  getColumns = (columns) => {
    if (!this.hasFixedColumns) return columns;
    const preparedColumns = ReactTableFixedColumns.preparedColumns(columns, this.hasGroups);
    const processColumns = this.processColumns(preparedColumns);
    console.log('processColumns', processColumns);
    return processColumns;
  }

  getProps = (...args) => {
    const { getProps } = this.props;
    return {
      ...(getProps && getProps(...args)),
      onScroll: this.onScrollX,
    };
  }

  getTbodyProps = (...args) => this.mergeProps(
    'getTbodyProps',
    args,
    {
      style: {
        zIndex: 1,
      },
    },
  );

  getTdAndThProps = (key, a) => (...args) => {
    const column = args[2];
    const nextProps = {
      'data-colid': getColumnId(column),
      style: {},
    };

    if (column.__fixedHidden) {
      nextProps.style.visibility = 'hidden';
    } else if (column.__fixedVisible) {
      nextProps.style = { ...styleFixedVisible };
      nextProps['data-fixedvisible'] = true;
    }

    if (column.__extraTdPropsStyle) {
      nextProps.style.left = column.__extraTdPropsStyle.left;
    }

    return this.mergeProps(
      key,
      args,
      nextProps,
    );
  }

  getTrProps = key => (...args) => this.mergeProps(
    key,
    args,
    {
      style: {
        position: 'relative',
      },
    },
  );

  innerRef = (c) => {
    const { innerRef } = this.props;
    if (innerRef) {
      innerRef(c);
    }
  }

  render() {
    this.columnFixedOffset = 0;
    this.columnGroupFixedOffset = 0;
    const { columns, ...props } = this.props;
    return (
      <ReactTable
        {...props}
        ref={this.innerRef}
        columns={this.getColumns(columns)}
        getTheadTrProps={this.getTrProps('getTheadTrProps')}
        getTheadThProps={this.getTdAndThProps('getTheadThProps')}
        getTheadGroupTrProps={this.getTrProps('getTheadGroupTrProps')}
        getTheadGroupThProps={this.getTdAndThProps('getTheadGroupThProps', true)}
        getTheadFilterTrProps={this.getTrProps('getTheadFilterTrProps')}
        getTheadFilterThProps={this.getTdAndThProps('getTheadFilterThProps')}
        getTbodyProps={this.getTbodyProps}
        getTrProps={this.getTrProps('getTrProps')}
        getTdProps={this.getTdAndThProps('getTdProps')}
        getProps={this.getProps}
        onResizedChange={this.onResizeChange}
        resized={this.state.resized}
      />
    );
  }
};
