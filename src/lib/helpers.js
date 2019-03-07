export const getColumnId = (column) => {
  if (column.id) return column.id;
  if (typeof column.accessor === 'string') return column.accessor;
  return null;
};

export const isLeftFixed = column => [true, 'left'].includes(column.fixed);
export const isRightFixed = column => column.fixed === 'right';
export const isNotFixed = column => !column.fixed;

export const sortColumns = columns => [
  ...columns.filter(isLeftFixed),
  ...columns.filter(isNotFixed),
  ...columns.filter(isRightFixed),
];

export const enableStickyPosition = () => {
  if (typeof window === 'undefined') return true; // document is undefined in SSR
  const el = document.createElement('a');
  const mStyle = el.style;
  mStyle.cssText = 'position:sticky;position:-webkit-sticky;position:-ms-sticky;';
  return mStyle.position.indexOf('sticky') !== -1;
};

export const checkErrors = (columns) => {
  const hasGroups = !!columns.find(column => column.columns);
  const fixedColumnsWithoutGroup = columns.filter(column => column.fixed && !column.columns).map(({ Header }) => `'${Header}'`);

  if (hasGroups && fixedColumnsWithoutGroup.length) {
    throw new Error(`WARNING react-table-hoc-fixed-column:
          \nYour ReactTable has group and fixed columns outside groups, and that will break UI.
          \nYou must place ${fixedColumnsWithoutGroup.join(' and ')} columns into a group (even a group with an empty Header label)\n`);
  }

  const bugWithUnderColumnsFixed = columns.find(parentCol => !parentCol.fixed && parentCol.columns && parentCol.columns.find(col => col.fixed));

  if (bugWithUnderColumnsFixed) {
    const childBugs = bugWithUnderColumnsFixed.columns.find(({ fixed }) => fixed);
    throw new Error(`WARNING react-table-hoc-fixed-column:
          \nYour ReactTable contain columns group with at least one child columns fixed.
          \nWhen ReactTable has columns groups, only columns groups can be fixed
          \nYou must set fixed: 'left' | 'right' for the '${bugWithUnderColumnsFixed.Header}' column, or remove the fixed property of '${childBugs.Header}' column.`);
  }
};

export const findNextColumnNotHidden = (columns, currentIndex) => {
  for (let i = currentIndex + 1; i < columns.length; i += 1) {
    const column = columns[i];
    if (column.show !== false) return column;
  }

  return undefined;
};

export const findPrevColumnNotHidden = (columns, currentIndex) => {
  for (let i = currentIndex - 1; i >= 0; i -= 1) {
    const column = columns[i];
    if (column.show !== false) return column;
  }

  return undefined;
};
