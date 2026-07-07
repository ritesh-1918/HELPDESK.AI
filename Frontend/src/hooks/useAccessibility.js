/**
 * useAccessibility — Custom hook for ARIA state management,
 * focus trapping, and keyboard navigation in modal/dropdown contexts.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Focus trap: keeps keyboard focus within a container while it is open.
 *
 * @param {boolean} isOpen    — Whether the trap is active
 * @param {function} onClose  — Callback to invoke when Escape is pressed
 * @returns {{ containerRef }} — Attach containerRef to the trapping element
 */
export function useFocusTrap(isOpen, onClose) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const container = containerRef.current;
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        const focusableElements = Array.from(container.querySelectorAll(focusableSelectors));
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        // Auto-focus first element when trap activates
        firstEl?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
                return;
            }
            if (e.key !== 'Tab') return;

            if (focusableElements.length === 0) {
                e.preventDefault();
                return;
            }

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl?.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return { containerRef };
}

/**
 * Dropdown aria-expanded state + keyboard navigation.
 *
 * @returns {{
 *   isExpanded: boolean,
 *   toggleExpanded: function,
 *   setExpanded: function,
 *   triggerProps: object,  — spread onto the trigger button
 *   menuProps: object,     — spread onto the menu container
 * }}
 */
export function useAriaDropdown() {
    const [isExpanded, setExpanded] = useState(false);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const toggleExpanded = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!isExpanded) return;

        const handleOutsideClick = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                menuRef.current && !menuRef.current.contains(e.target)
            ) {
                setExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isExpanded]);

    // Close on Escape
    useEffect(() => {
        if (!isExpanded) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setExpanded(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isExpanded]);

    const triggerProps = {
        ref: triggerRef,
        'aria-expanded': isExpanded,
        'aria-haspopup': 'true',
        onClick: toggleExpanded,
    };

    const menuProps = {
        ref: menuRef,
        role: 'menu',
        'aria-hidden': !isExpanded,
    };

    return { isExpanded, toggleExpanded, setExpanded, triggerProps, menuProps };
}

/**
 * Keyboard navigation for a list of items (arrow key navigation).
 *
 * @param {number} itemCount  — Total number of items in the list
 * @param {function} onSelect — Called with index when Enter/Space pressed
 * @returns {{ activeIndex, listProps, getItemProps }}
 */
export function useListKeyboardNav(itemCount, onSelect) {
    const [activeIndex, setActiveIndex] = useState(-1);

    const handleKeyDown = useCallback(
        (e) => {
            if (itemCount === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex((prev) => (prev + 1) % itemCount);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (activeIndex >= 0) onSelect?.(activeIndex);
                    break;
                case 'Home':
                    e.preventDefault();
                    setActiveIndex(0);
                    break;
                case 'End':
                    e.preventDefault();
                    setActiveIndex(itemCount - 1);
                    break;
                default:
                    break;
            }
        },
        [activeIndex, itemCount, onSelect]
    );

    const listProps = {
        role: 'listbox',
        onKeyDown: handleKeyDown,
        tabIndex: 0,
    };

    const getItemProps = (index) => ({
        role: 'option',
        'aria-selected': index === activeIndex,
        tabIndex: index === activeIndex ? 0 : -1,
        onClick: () => {
            setActiveIndex(index);
            onSelect?.(index);
        },
    });

    return { activeIndex, listProps, getItemProps };
}

/**
 * Hook that generates accessible sort button props for table column headers.
 *
 * @param {string} column         — Column key
 * @param {string} currentSort    — Currently sorted column key
 * @param {'asc'|'desc'} direction — Current sort direction
 * @param {function} onSort       — Callback(column, direction)
 * @returns {object} — Props to spread onto a <button> or <th>
 */
export function useSortableColumn(column, currentSort, direction, onSort) {
    const isActive = currentSort === column;
    const nextDirection = isActive && direction === 'asc' ? 'desc' : 'asc';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSort?.(column, nextDirection);
        }
    };

    return {
        role: 'columnheader',
        tabIndex: 0,
        'aria-sort': isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none',
        onClick: () => onSort?.(column, nextDirection),
        onKeyDown: handleKeyDown,
    };
}

export default {
    useFocusTrap,
    useAriaDropdown,
    useListKeyboardNav,
    useSortableColumn,
};
