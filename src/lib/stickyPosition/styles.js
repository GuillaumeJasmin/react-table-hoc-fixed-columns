import { css } from 'emotion';

export const fixedClassName = css`
  position: sticky !important;
  z-index: 1;
`;

export const getTableClassName = oddRowColor => css`
  .-header .rt-th,
  .-filters .rt-th,
  .rt-td {
    background-color: white;
  }

  .rt-tr.-odd .rt-td {
    background-color: ${oddRowColor};
  }

  .-headerGroups .rt-th {
    background-color: #f7f7f7;
  }

  .-header .rt-th {
    border-bottom: solid 1px #eee;
  }

  .rt-tbody {
    overflow: visible !important;
  }
`;

export const fixedLeftClassName = css`
  left: 0;
`;

export const fixedRightClassName = css`
  right: 0;
`;
