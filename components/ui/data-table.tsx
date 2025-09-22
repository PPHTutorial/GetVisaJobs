'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    MoreHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    Notebook,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for the DataTable component
export interface Column<T> {
    key: keyof T | string
    header: string
    sortable?: boolean
    filterable?: boolean
    render?: (value: any, item: T) => React.ReactNode
    className?: string
    hidden?: boolean // For responsive design
}

export interface Action<T> {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: (item: T) => void
    variant?: 'default' | 'destructive'
    disabled?: (item: T) => boolean
}

export interface FilterOption {
    label: string
    value: string
    count?: number
}

export interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    actions?: Action<T>[]
    loading?: boolean
    searchPlaceholder?: string
    emptyMessage?: string
    pageSize?: number
    className?: string
    onRowClick?: (item: T) => void
    defaultSort?: {
        key: keyof T | string
        direction: 'asc' | 'desc'
    }
}

// Sort direction type
type SortDirection = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    actions = [],
    loading = false,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data found',
    pageSize = 10,
    className,
    onRowClick,
    defaultSort,
}: DataTableProps<T>) {
    // State management
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortKey, setSortKey] = useState<keyof T | string | null>(defaultSort?.key || null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || null)
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    // Get searchable columns (columns that can be searched)
    const searchableColumns = useMemo(() =>
        columns.filter(col => !col.hidden && typeof col.key === 'string'),
        [columns]
    )

    // Filter data based on search term
    const filteredData = useMemo(() => {
        let filtered = data

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                searchableColumns.some(col => {
                    const value = item[col.key as keyof T]
                    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                })
            )
        }

        // Apply column filters
        Object.entries(activeFilters).forEach(([columnKey, selectedValues]) => {
            if (selectedValues.length > 0) {
                filtered = filtered.filter(item => {
                    const value = item[columnKey as keyof T]
                    return selectedValues.includes(value?.toString() || '')
                })
            }
        })

        return filtered
    }, [data, searchTerm, searchableColumns, activeFilters])

    // Sort filtered data
    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return filteredData

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortKey as keyof T]
            const bValue = b[sortKey as keyof T]

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sortDirection === 'asc' ? -1 : 1
            if (bValue == null) return sortDirection === 'asc' ? 1 : -1

            // Handle different data types
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue)
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }

            if (aValue && bValue && typeof aValue === 'object' && typeof bValue === 'object' &&
                'getTime' in aValue && 'getTime' in bValue && typeof aValue.getTime === 'function' && typeof bValue.getTime === 'function') {
                return sortDirection === 'asc'
                    ? (aValue as Date).getTime() - (bValue as Date).getTime()
                    : (bValue as Date).getTime() - (aValue as Date).getTime()
            }

            // Default string comparison
            const aStr = String(aValue)
            const bStr = String(bValue)
            return sortDirection === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr)
        })
    }, [filteredData, sortKey, sortDirection])

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize)
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return sortedData.slice(startIndex, startIndex + pageSize)
    }, [sortedData, currentPage, pageSize])

    // Reset to first page when filters change
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }, [])

    const handleSort = useCallback((key: keyof T | string) => {
        if (sortKey === key) {
            // Cycle through sort directions: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortDirection(null)
                setSortKey(null)
            }
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
        setCurrentPage(1)
    }, [sortKey, sortDirection])

    const handleFilterChange = useCallback((columnKey: string, values: string[]) => {
        setActiveFilters(prev => ({
            ...prev,
            [columnKey]: values
        }))
        setCurrentPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setActiveFilters({})
        setSearchTerm('')
        setCurrentPage(1)
    }, [])

    const getSortIcon = (columnKey: keyof T | string) => {
        if (sortKey !== columnKey) return <ArrowUpDown className="h-4 w-4" />
        if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />
        if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />
        return <ArrowUpDown className="h-4 w-4" />
    }

    // Loading state
    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Active filters display */}
                    {Object.keys(activeFilters).length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Filters:</span>
                            {Object.entries(activeFilters).map(([key, values]) =>
                                values.map(value => (
                                    <Badge key={`${key}-${value}`} variant="secondary" className="text-xs">
                                        {columns.find(col => col.key === key)?.header}: {value}
                                        <button
                                            onClick={() => handleFilterChange(key, values.filter(v => v !== value))}
                                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-xs h-6 px-2"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {/* Results count */}
                <div className="text-sm text-muted-foreground">
                    {sortedData.length} of {data.length} items
                </div>
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto ">
                    <Table>
                        <TableHeader className='bg-input/30'>
                            <TableRow>
                                {columns
                                    .filter(col => !col.hidden)
                                    .map((column) => (
                                        <TableHead
                                            key={String(column.key)}
                                            className={cn(
                                                column.sortable && 'cursor-pointer select-none hover:bg-muted/50',
                                                column.className,
                                                ''
                                            )}
                                            onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                        >
                                            <div className="flex items-center gap-2 ">
                                                {column.header}
                                                {column.sortable && getSortIcon(column.key)}
                                            </div>
                                        </TableHead>
                                    ))}
                                {actions.length > 0 && (
                                    <TableHead className="w-[70px]">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.filter(col => !col.hidden).length + (actions.length > 0 ? 1 : 0)}
                                        className="text-center text-muted-foreground h-32"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <svg
                                                        className="w-6 h-6 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m2-1h6.5"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="space-y-1">
                                                    <span>{emptyMessage}</span>
                                                    <p className="text-xs text-gray-500">There are no records to display at this time.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <TableRow
                                        key={index}
                                        className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {columns
                                            .filter(col => !col.hidden)
                                            .map((column) => (
                                                <TableCell key={String(column.key)} className={column.className}>
                                                    {column.render
                                                        ? column.render(item[column.key as keyof T], item)
                                                        : String(item[column.key as keyof T] || '')
                                                    }
                                                </TableCell>
                                            ))}
                                        {actions.length > 0 && (
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className='bg-white dark:bg-gray-800'>
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {actions.map((action, actionIndex) => (
                                                            <DropdownMenuItem
                                                                key={actionIndex}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    action.onClick(item)
                                                                }}
                                                                disabled={action.disabled?.(item)}
                                                                className={cn(
                                                                    action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                                                                )}
                                                            >
                                                                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                                                {action.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Page {currentPage} of {totalPages}</span>
                        <span>•</span>
                        <span>{paginatedData.length} items</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(_value) => {
                                setCurrentPage(1)
                                // This would need to be handled by parent component
                            }}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}