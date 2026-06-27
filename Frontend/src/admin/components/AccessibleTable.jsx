/**
 * AccessibleTable — Wrapper component that applies all required ARIA attributes
 * to a data table automatically. Supports keyboard navigation, loading states,
 * live status announcements, and sortable column headers.
 */

import React, { useCallback } from 'react';
import { useSortableColumn } from '../../hooks/useAccessibility';

/**
 * AccessibleTable
 *
 * Props:
 *   columns       Array<{ key, label, sortable? }>
 *   rows          Array<object>
 *   isLoading     boolean
 *   caption       string  — accessible table caption (screen reader)
 *   onRowClick    function(row, index)
 *   onSort        function(column, direction)
 *   sortColumn    string
 *   sortDirection 'asc' | 'desc'
 *   statusMessage string  — live region message (e.g. "5 tickets loaded")
 *   emptyMessage  string
 *   getRowAriaLabel function(row) → string
 */
const AccessibleTable = ({
    columns = [],
    rows = [],
    isLoading = false,
    caption,
    onRowClick,
    onSort,
    sortColumn,
    sortDirection = 'asc',
    statusMessage,
    emptyMessage = 'No data available.',
    getRowAriaLabel,
    className = '',
}) => {
    const handleRowKeyDown = useCallback(
        (e, row, index) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick?.(row, index);
            }
        },
        [onRowClick]
    );

    return (
        <div className={`accessible-table-wrapper ${className}`}>
            {/* Live region for dynamic status updates */}
            <div
                aria-live="polite"
                aria-atomic="true"
                role="status"
                className="sr-only"
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
            >
                {statusMessage || ''}
            </div>

            <table
                role="table"
                aria-label={caption || 'Data table'}
                aria-busy={isLoading}
                aria-rowcount={rows.length}
                style={{ width: '100%', borderCollapse: 'collapse' }}
            >
                {caption && (
                    <caption className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
                        {caption}
                    </caption>
                )}

                <thead>
                    <tr role="row">
                        {columns.map((col) =>
                            col.sortable ? (
                                <SortableHeader
                                    key={col.key}
                                    column={col.key}
                                    label={col.label}
                                    currentSort={sortColumn}
                                    direction={sortDirection}
                                    onSort={onSort}
                                />
                            ) : (
                                <th
                                    key={col.key}
                                    role="columnheader"
                                    scope="col"
                                    style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: '#6b7280',
                                        background: '#f8faf9',
                                        borderBottom: '1px solid #f0fdf4',
                                    }}
                                >
                                    {col.label}
                                </th>
                            )
                        )}
                    </tr>
                </thead>

                <tbody role="rowgroup">
                    {isLoading ? (
                        <tr role="row">
                            <td
                                role="cell"
                                colSpan={columns.length}
                                style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}
                                aria-label="Loading data, please wait"
                            >
                                <span aria-hidden="true">Loading...</span>
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr role="row">
                            <td
                                role="cell"
                                colSpan={columns.length}
                                style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => {
                            const rowLabel = getRowAriaLabel
                                ? getRowAriaLabel(row)
                                : `Row ${rowIndex + 1}`;
                            const isClickable = Boolean(onRowClick);

                            return (
                                <tr
                                    key={row.id || row.ticket_id || rowIndex}
                                    role="row"
                                    aria-rowindex={rowIndex + 1}
                                    aria-label={rowLabel}
                                    tabIndex={isClickable ? 0 : undefined}
                                    onClick={isClickable ? () => onRowClick(row, rowIndex) : undefined}
                                    onKeyDown={isClickable ? (e) => handleRowKeyDown(e, row, rowIndex) : undefined}
                                    style={{
                                        cursor: isClickable ? 'pointer' : 'default',
                                        borderBottom: '1px solid #f9fafb',
                                        transition: 'background 0.15s',
                                    }}
                                    className={isClickable ? 'accessible-table-row' : ''}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            role="cell"
                                            style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}
                                        >
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : row[col.key] ?? '—'}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

/**
 * SortableHeader — A <th> with aria-sort and keyboard activation.
 */
const SortableHeader = ({ column, label, currentSort, direction, onSort }) => {
    const sortProps = useSortableColumn(column, currentSort, direction, onSort);
    const isActive = currentSort === column;

    return (
        <th
            {...sortProps}
            scope="col"
            aria-label={`${label}, ${isActive ? (direction === 'asc' ? 'sorted ascending' : 'sorted descending') : 'not sorted'}`}
            style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isActive ? '#16a34a' : '#6b7280',
                background: '#f8faf9',
                borderBottom: '1px solid #f0fdf4',
                cursor: 'pointer',
                userSelect: 'none',
                outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.outline = '2px solid #10b981'; }}
            onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {label}
                {isActive && (
                    <span aria-hidden="true" style={{ fontSize: '10px' }}>
                        {direction === 'asc' ? '▲' : '▼'}
                    </span>
                )}
            </span>
        </th>
    );
};

export default AccessibleTable;
