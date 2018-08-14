import { enableStickyPosition } from './helpers';
import fixedColumnsStickyPosition from './stickyPosition';
import fixedColumnsScrollEvent from './scrollEvent';

const fixedColumns = enableStickyPosition()
  ? fixedColumnsStickyPosition
  : fixedColumnsScrollEvent; // use for legacy browser

export {
  fixedColumnsStickyPosition,
  fixedColumnsScrollEvent,
};

export default fixedColumns;
