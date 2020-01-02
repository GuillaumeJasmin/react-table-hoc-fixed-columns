import { Column, TableProps } from 'react-table'

export interface ColumnFixed<D = any> extends Column<D> {
  fixed?: 'left' | 'right' | true;
  columns?: Array<ColumnFixed<D>>;
}

export interface TablePropsColumnFixed<D = any, ResolvedData = D> extends TableProps<D, ResolvedData> {
  columns?: Array<ColumnFixed<ResolvedData>>;
}

export function withFixedColumnsStickyPosition<D = any>(ReactTableComponent: React.ComponentType<Partial<TableProps<D>>>): React.ComponentType<Partial<TablePropsColumnFixed<D>>>
export function withFixedColumnsScrollEvent<D = any>(ReactTableComponent: React.ComponentType<Partial<TableProps<D>>>): React.ComponentType<Partial<TablePropsColumnFixed<D>>>
export default function withFixedColumns<D = any>(ReactTableComponent: React.ComponentType<Partial<TableProps<D>>>): React.ComponentType<Partial<TablePropsColumnFixed<D>>>