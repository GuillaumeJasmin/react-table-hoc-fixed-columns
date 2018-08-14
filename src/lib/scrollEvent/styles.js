import { css } from 'emotion';
import uniqid from 'uniqid';

export const fixedLeftClassName = uniqid();
export const fixedRightClassName = uniqid();

export const fixedClassName = css`
  position: relative;
  z-Index: 2;
`;

export const tableClassName = css`
  .-header .rt-th,
  .-filters .rt-th,
  .rt-td.${fixedClassName} {
    background-color: #fff;
  }

  .-headerGroups .rt-th {
    background-color: #f7f7f7;
  }

  .-header .rt-th {
    border-bottom: solid 1px #eee;
  }
`;
