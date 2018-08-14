import { css } from 'emotion';

export const border = 'solid 1px #ccc !important';

export const lastLeftFixedClassName = css`
  border-right: ${border};
`;

export const lastRightFixedClassName = css`
  border-left: ${border};
`;
