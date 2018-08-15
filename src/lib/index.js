import { enableStickyPosition } from './helpers';
import withFixedColumnsStickyPosition from './stickyPosition';
import withFixedColumnsScrollEvent from './scrollEvent';

const withFixedColumns = enableStickyPosition()
  ? withFixedColumnsStickyPosition
  : withFixedColumnsScrollEvent; // use for legacy browser

export {
  withFixedColumnsStickyPosition,
  withFixedColumnsScrollEvent,
};

export default withFixedColumns;
