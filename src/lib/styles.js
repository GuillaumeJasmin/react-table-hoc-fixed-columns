import { css } from 'emotion';

export const border = 'solid 1px #ccc !important';

export const lastLeftFixedClassName = css`
  border-right: ${border};
`;

export const lastRightFixedClassName = css`
  border-left: ${border};
`;

export const getTableClassName = (props) => {
  const { className } = props;
  let { stripedColor, highlightColor } = props;

  if (!stripedColor && (className || '').indexOf('-striped') !== -1) {
    stripedColor = '#f7f7f7';
  }

  if (!highlightColor && (className || '').indexOf('-highlight') !== -1) {
    highlightColor = '#f2f2f2';
  }

  return css`
    .-header .rt-th,
    .-filters .rt-th,
    .rt-td {
      background-color: white;
    }

    .rt-tr.-odd .rt-td {
      background-color: ${stripedColor};
    }

    .rt-tr:hover .rt-td {
      background-color: ${highlightColor};
    }

    .-headerGroups .rt-th {
      background-color: #f7f7f7;
    }

    .-header .rt-th {
      border-bottom: solid 1px #eee;
    }
  `;
};
