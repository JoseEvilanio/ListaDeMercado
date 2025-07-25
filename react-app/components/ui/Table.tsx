import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
}

function Table<T>({
  data,
  columns,
  keyExtractor,
  className = '',
  striped = false,
  hoverable = false,
  compact = false,
  bordered = false,
  onRowClick,
  emptyMessage = 'Nenhum dado encontrado',
  loading = false,
  loadingRows = 5
}: TableProps<T>) {
  // Classes da tabela
  const tableClasses = [
    'min-w-full divide-y divide-neutral-200 dark:divide-neutral-700',
    bordered ? 'border border-neutral-200 dark:border-neutral-700' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Classes do cabeçalho
  const headerClasses = [
    'bg-neutral-50 dark:bg-neutral-800',
    bordered ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
  ].filter(Boolean).join(' ');
  
  // Classes das células do cabeçalho
  const headerCellClasses = [
    'px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider',
    compact ? 'px-4 py-2' : ''
  ].filter(Boolean).join(' ');
  
  // Classes das linhas
  const getRowClasses = (index: number) => [
    striped && index % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900',
    hoverable ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800' : '',
    onRowClick ? 'cursor-pointer' : '',
    bordered ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
  ].filter(Boolean).join(' ');
  
  // Classes das células
  const getCellClasses = (column: Column<T>) => [
    'px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-200',
    compact ? 'px-4 py-2' : '',
    column.className || '',
    column.hideOnMobile ? 'hidden sm:table-cell' : '',
    column.hideOnTablet ? 'hidden md:table-cell' : ''
  ].filter(Boolean).join(' ');
  
  // Renderizar célula de carregamento
  const renderLoadingCell = (columnIndex: number) => {
    const column = columns[columnIndex];
    return (
      <td key={columnIndex} className={getCellClasses(column)}>
        <div className="animate-pulse h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      </td>
    );
  };
  
  // Renderizar linha de carregamento
  const renderLoadingRow = (rowIndex: number) => (
    <tr key={`loading-${rowIndex}`} className={getRowClasses(rowIndex)}>
      {columns.map((_, columnIndex) => renderLoadingCell(columnIndex))}
    </tr>
  );
  
  // Renderizar célula
  const renderCell = (item: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(item);
    }
    
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    
    return item[column.accessor] as React.ReactNode;
  };
  
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className={tableClasses}>
        <thead className={headerClasses}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`${headerCellClasses} ${column.hideOnMobile ? 'hidden sm:table-cell' : ''} ${column.hideOnTablet ? 'hidden md:table-cell' : ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
          {loading ? (
            Array.from({ length: loadingRows }).map((_, index) => renderLoadingRow(index))
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={getRowClasses(index)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, columnIndex) => (
                  <td key={columnIndex} className={getCellClasses(column)}>
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;