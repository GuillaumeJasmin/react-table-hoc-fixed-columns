import { css } from 'emotion';

export const fixedClassName = css`
  position: sticky !important;
  z-index: 1;
`;

export const fixedLeftClassName = css`
  left: 0;
`;

export const fixedRightClassName = css`
  right: 0;
`;

export const tableClassName = css`
  .rt-tbody {
    overflow: visible !important;
  }

  .rt-thead {
    position: sticky;
    z-index: 2;
  }

  .rt-thead.-headerGroups {
    border-bottom-color: #f2f2f2 !important;
  }
`;
