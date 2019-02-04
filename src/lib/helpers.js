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
  if (!document) return true; // document is undefined in SSR
  const el = document.createElement('a');
  const mStyle = el.style;
  mStyle.cssText = 'position:sticky;position:-webkit-sticky;position:-ms-sticky;';
  return mStyle.position.indexOf('sticky') !== -1;
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

