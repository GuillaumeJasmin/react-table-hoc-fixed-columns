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
  const el = document.createElement('a');
  const mStyle = el.style;
  mStyle.cssText = 'position:sticky;position:-webkit-sticky;position:-ms-sticky;';
  return mStyle.position.indexOf('sticky') !== -1;
};
