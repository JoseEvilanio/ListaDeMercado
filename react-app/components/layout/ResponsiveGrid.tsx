import React from 'react';

type ColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: ColumnCount;
    sm?: ColumnCount;
    md?: ColumnCount;
    lg?: ColumnCount;
    xl?: ColumnCount;
  };
  gap?: {
    x?: number;
    y?: number;
  };
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4
  },
  gap = {
    x: 4,
    y: 4
  },
  className = ''
}) => {
  // Mapear número de colunas para classes Tailwind
  const getColsClass = (colCount: ColumnCount | undefined, breakpoint: string) => {
    if (!colCount) return '';
    
    const gridColsMap: Record<ColumnCount, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12'
    };
    
    if (breakpoint === 'xs') {
      return gridColsMap[colCount];
    }
    
    const breakpointMap: Record<string, string> = {
      'sm': 'sm:',
      'md': 'md:',
      'lg': 'lg:',
      'xl': 'xl:'
    };
    
    return `${breakpointMap[breakpoint]}${gridColsMap[colCount]}`;
  };
  
  // Construir classes de grid
  const gridClasses = [
    'grid',
    getColsClass(cols.xs, 'xs'),
    getColsClass(cols.sm, 'sm'),
    getColsClass(cols.md, 'md'),
    getColsClass(cols.lg, 'lg'),
    getColsClass(cols.xl, 'xl'),
    `gap-x-${gap.x}`,
    `gap-y-${gap.y}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;