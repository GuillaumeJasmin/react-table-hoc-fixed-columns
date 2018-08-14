import React from 'react';
import PropTypes from 'prop-types';

const getFixedColumnId = id => `__fixedHidden__${id}`;
const getColumnId = column => column.id || column.accessor;

const styleFixedVisible = {
  position: 'absolute',
  height: '100%',
  backgroundColor: '#fff',
  zIndex: 3,
};

export default ReactTable => class ReactTableFixedColumns extends React.Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    getTdProps: PropTypes.func,
    getTheadThProps: PropTypes.func,
    getProps: PropTypes.func,
    onResizedChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    innerRef: PropTypes.func,
    loading: PropTypes.bool,
  }

  static defaultProps = {
    getTdProps: () => ({}),
    getTheadThProps: () => ({}),
    getProps: () => ({}),
    onResizedChange: null,
    onPageSizeChange: null,
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

  constructor(props) {
    super(props);
    this.hasFixedColumns = !!props.columns.find(({ fixed }) => fixed === true);
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
      const width = Array.from(document.querySelectorAll('.rt-thead.-header [data-fixedvisible="true"]'))
        .map($el => $el.offsetWidth)
        .reduce((a, b) => a + b, 0);
      $offsetEl.style.marginLeft = `-${width}px`;
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

  onResizedChange = (resized, ...rest) => {
    const { onResizedChange } = this.props;
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

    if (onResizedChange) {
      onResizedChange(resized, ...rest);
    }
  }

  onPageSizeChange = (...args) => {
    const { onPageSizeChange } = this.props;
    if (onPageSizeChange) {
      onPageSizeChange(...args);
    }
    this.updateLeftPos();
  }

  calculateOffsetLeft() {
    for (let i = 0; i < this.fixedColumns.length; i += 1) {
      if (i > 0) {
        const prev = this.fixedColumns[i - 1];
        this.fixedColumns[i].offsetLeft = prev.offsetLeft + prev.width;
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

  processColumns(columns) {
    let columnFixedOffset = 0;

    return columns
      .map((column) => {
        const nextColumn = {
          ...column,
          columns: column.columns && this.processColumns(column.columns),
        };

        const columnId = getColumnId(nextColumn);
        if (nextColumn.fixed) {
          const output = [
            {
              ...nextColumn,
              width: nextColumn.width || 200,
              __fixedVisible: true,
              __extraTdPropsStyle: {
                left: columnFixedOffset,
              },
            },
            {
              ...nextColumn,
              width: nextColumn.width || 200,
              __fixedHidden: true,
              id: getFixedColumnId(columnId),
            },
          ];

          if (!this.fixedColumns.find(({ id }) => id === columnId)) {
            this.fixedColumns.push({
              id: columnId,
              width: nextColumn.width,
              offsetLeft: columnFixedOffset,
            });
          }

          columnFixedOffset += nextColumn.width;

          return output;
        }

        return [nextColumn];
      })
      .reduce((a, b) => [...a, ...b], []);
  }

  getColumns = (columns) => {
    const hasFixedColumns = !!columns.find(({ fixed }) => fixed === true);
    if (!hasFixedColumns) return columns;
    const preparedColumns = ReactTableFixedColumns.preparedColumns(columns);
    return this.processColumns(preparedColumns);
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

  getTdAndThProps = key => (...args) => {
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
    const { columns, ...props } = this.props;
    return (
      <ReactTable
        {...props}
        ref={this.innerRef}
        columns={this.getColumns(columns)}
        getTheadTrProps={this.getTrProps('getTheadTrProps')}
        getTheadThProps={this.getTdAndThProps('getTheadThProps')}
        getTheadFilterTrProps={this.getTrProps('getTheadFilterTrProps')}
        getTheadFilterThProps={this.getTdAndThProps('getTheadFilterThProps')}
        getTbodyProps={this.getTbodyProps}
        getTrProps={this.getTrProps('getTrProps')}
        getTdProps={this.getTdAndThProps('getTdProps')}
        getProps={this.getProps}
        onResizedChange={this.onResizedChange}
        onPageSizeChange={this.onPageSizeChange}
        resized={this.state.resized}
      />
    );
  }
};
