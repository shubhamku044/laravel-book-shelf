import useDebounce from '@/hooks/use-debounce';
import { BookSortBy, BookSortOrder } from '@/types';
import { Book, PaginationMeta } from '@/types/api';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

// Define action types
type BookListAction =
    | { type: 'SET_BOOKS'; payload: Book[] }
    | { type: 'SET_META'; payload: PaginationMeta }
    | { type: 'SET_SORT'; payload: { sortBy: BookSortBy; sortOrder: BookSortOrder } }
    | { type: 'SET_PER_PAGE'; payload: number }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_IS_SEARCHING'; payload: boolean }
    | { type: 'SET_IS_LOADING'; payload: boolean }
    | { type: 'SET_SEARCH_COMPLETE'; payload: boolean }
    | { type: 'CLEAR_SEARCH' };

// Define state type
interface BookListState {
    books: Book[];
    meta: PaginationMeta;
    searchQuery: string;
    isSearching: boolean;
    isLoading: boolean;
    searchComplete: boolean;
    perPage: number;
    sortBy: BookSortBy;
    sortOrder: BookSortOrder;
}

// Initial state
const initialState: BookListState = {
    books: [],
    meta: {
        current_page: 1,
        per_page: 5,
        total: 0,
        last_page: 1,
        sort_by: 'created_at',
        sort_order: 'desc',
    },
    searchQuery: '',
    isSearching: false,
    isLoading: true,
    searchComplete: false,
    perPage: 5,
    sortBy: BookSortBy.CREATED_AT,
    sortOrder: BookSortOrder.DESC,
};

function bookListReducer(state: BookListState, action: BookListAction): BookListState {
    switch (action.type) {
        case 'SET_BOOKS':
            return { ...state, books: action.payload };
        case 'SET_META':
            return { ...state, meta: action.payload };
        case 'SET_SORT':
            return {
                ...state,
                sortBy: action.payload.sortBy,
                sortOrder: action.payload.sortOrder,
            };
        case 'SET_PER_PAGE':
            return { ...state, perPage: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_IS_SEARCHING':
            return { ...state, isSearching: action.payload };
        case 'SET_IS_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_SEARCH_COMPLETE':
            return { ...state, searchComplete: action.payload };
        case 'CLEAR_SEARCH':
            return {
                ...state,
                searchQuery: '',
                isSearching: false,
                searchComplete: false,
            };
        default:
            return state;
    }
}

export function useBookList() {
    const [state, dispatch] = useReducer(bookListReducer, initialState);

    const prevSearchQuery = useRef('');
    const isInitialSearchRender = useRef(true);

    const { books, meta, searchQuery, isSearching, isLoading, searchComplete, perPage, sortBy, sortOrder } = state;

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const perPageOptions = useMemo(() => [5, 10, 20, 50, 100], []);

    const updateUrlParams = useCallback((params: Record<string, string>) => {
        const url = new URL(window.location.href);

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });

        window.history.pushState({}, '', url.toString());
    }, []);

    const fetchBooks = useCallback(
        async (page: number = 1, itemsPerPage: number = perPage, sortColumn: string = sortBy, sortDirection: string = sortOrder) => {
            const validItemsPerPage = itemsPerPage > 0 ? itemsPerPage : 5;

            dispatch({ type: 'SET_IS_LOADING', payload: true });

            try {
                const response = await fetch(
                    `/api/v1/books?page=${page}&per_page=${validItemsPerPage}&sort_by=${sortColumn}&sort_order=${sortDirection}`,
                );
                const data = await response.json();

                if (data.success && data.data) {
                    dispatch({ type: 'SET_BOOKS', payload: data.data });

                    const responsePerPage = Number(data.meta.per_page);
                    if (responsePerPage > 0 && responsePerPage !== perPage) {
                        dispatch({ type: 'SET_PER_PAGE', payload: responsePerPage });
                    }

                    dispatch({
                        type: 'SET_META',
                        payload: {
                            current_page: data.meta.current_page,
                            per_page: data.meta.per_page,
                            total: data.meta.total,
                            last_page: data.meta.last_page,
                            sort_by: data.meta.sort_by,
                            sort_order: data.meta.sort_order,
                        },
                    });

                    updateUrlParams({
                        page: data.meta.current_page.toString(),
                        per_page: data.meta.per_page.toString(),
                        sort_by: data.meta.sort_by,
                        sort_order: data.meta.sort_order,
                    });
                } else {
                    console.error('API returned success: false', data);
                    dispatch({ type: 'SET_BOOKS', payload: [] });
                }
            } catch (error) {
                console.error('Error fetching books:', error);
                dispatch({ type: 'SET_BOOKS', payload: [] });
            } finally {
                dispatch({ type: 'SET_IS_LOADING', payload: false });
            }
        },
        [perPage, sortBy, sortOrder, updateUrlParams],
    );

    const searchBooks = useCallback(
        async (query: string, page: number = 1, itemsPerPage: number = perPage, sortColumn: string = sortBy, sortDirection: string = sortOrder) => {
            const validItemsPerPage = itemsPerPage > 0 ? itemsPerPage : 5;

            dispatch({ type: 'SET_IS_LOADING', payload: true });
            dispatch({ type: 'SET_IS_SEARCHING', payload: true });
            dispatch({ type: 'SET_SEARCH_COMPLETE', payload: false });

            try {
                const response = await fetch(
                    `/api/v1/books/search?q=${encodeURIComponent(query.trim())}&page=${page}&per_page=${validItemsPerPage}&sort_by=${sortColumn}&sort_order=${sortDirection}`,
                );
                const data = await response.json();

                if (data.success) {
                    dispatch({ type: 'SET_BOOKS', payload: data.data || [] });

                    const responsePerPage = Number(data.meta.per_page);
                    if (responsePerPage > 0) {
                        dispatch({ type: 'SET_PER_PAGE', payload: responsePerPage });
                    }

                    dispatch({
                        type: 'SET_META',
                        payload: {
                            current_page: data.meta.current_page,
                            per_page: data.meta.per_page,
                            total: data.meta.total,
                            last_page: data.meta.last_page,
                            sort_by: data.meta.sort_by,
                            sort_order: data.meta.sort_order,
                        },
                    });

                    updateUrlParams({
                        q: query.trim(),
                        page: data.meta.current_page.toString(),
                        per_page: data.meta.per_page.toString(),
                        sort_by: data.meta.sort_by,
                        sort_order: data.meta.sort_order,
                    });
                } else {
                    console.error('Invalid API response format:', data);
                    dispatch({ type: 'SET_BOOKS', payload: [] });
                }
            } catch (error) {
                console.error('Error searching books:', error);
                dispatch({ type: 'SET_BOOKS', payload: [] });
            } finally {
                dispatch({ type: 'SET_IS_LOADING', payload: false });
                dispatch({ type: 'SET_IS_SEARCHING', payload: false });
                dispatch({ type: 'SET_SEARCH_COMPLETE', payload: true });
            }
        },
        [perPage, sortBy, sortOrder, updateUrlParams],
    );

    const handleSearchInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const previousValue = searchQuery;
            dispatch({ type: 'SET_SEARCH_QUERY', payload: value });

            if (value.trim()) {
                dispatch({ type: 'SET_IS_SEARCHING', payload: true });
                dispatch({ type: 'SET_SEARCH_COMPLETE', payload: false });
            } else if (previousValue && value === '') {
                dispatch({ type: 'SET_IS_SEARCHING', payload: false });
                dispatch({ type: 'SET_IS_SEARCHING', payload: false });
                dispatch({ type: 'SET_SEARCH_COMPLETE', payload: false });

                updateUrlParams({
                    q: '',
                    page: '1',
                    per_page: perPage.toString(),
                    sort_by: sortBy,
                    sort_order: sortOrder,
                });

                fetchBooks(1);
            }
        },
        [fetchBooks, perPage, searchQuery, sortBy, sortOrder, updateUrlParams],
    );

    const handlePageChange = useCallback(
        (page: number) => {
            if (isLoading) return;

            if (searchQuery) {
                searchBooks(searchQuery, page, perPage, sortBy, sortOrder);
            } else {
                fetchBooks(page, perPage, sortBy, sortOrder);
            }
        },
        [fetchBooks, isLoading, perPage, searchBooks, searchQuery, sortBy, sortOrder],
    );

    const handleSortChange = useCallback(
        (column: BookSortBy) => {
            if (isLoading) return;

            let newSortBy = column;
            let newSortDirection = sortOrder;

            if (column === sortBy) {
                if (sortOrder === BookSortOrder.ASC) {
                    newSortDirection = BookSortOrder.DESC;
                } else {
                    newSortBy = BookSortBy.CREATED_AT;
                    newSortDirection = BookSortOrder.DESC;
                }
            } else {
                newSortDirection = BookSortOrder.ASC;
            }

            dispatch({
                type: 'SET_SORT',
                payload: {
                    sortBy: newSortBy,
                    sortOrder: newSortDirection,
                },
            });

            updateUrlParams({
                page: '1',
                per_page: perPage.toString(),
                sort_by: newSortBy,
                sort_order: newSortDirection,
                ...(searchQuery ? { q: searchQuery } : {}),
            });

            if (isSearching) {
                searchBooks(searchQuery, 1, perPage, newSortBy, newSortDirection);
            } else {
                fetchBooks(1, perPage, newSortBy, newSortDirection);
            }
        },
        [fetchBooks, isLoading, isSearching, perPage, searchBooks, searchQuery, sortBy, sortOrder, updateUrlParams],
    );

    const handlePerPageChange = useCallback(
        (newPerPage: number) => {
            if (isLoading) return;
            if (!newPerPage || isNaN(newPerPage) || newPerPage <= 0) {
                console.error('Invalid per page value:', newPerPage);
                return;
            }

            dispatch({ type: 'SET_PER_PAGE', payload: newPerPage });

            updateUrlParams({
                page: '1',
                per_page: newPerPage.toString(),
                sort_by: sortBy,
                sort_order: sortOrder,
                ...(searchQuery ? { q: searchQuery } : {}),
            });

            if (isSearching) {
                searchBooks(searchQuery, 1, newPerPage, sortBy, sortOrder);
            } else {
                fetchBooks(1, newPerPage, sortBy, sortOrder);
            }
        },
        [fetchBooks, isLoading, isSearching, searchBooks, searchQuery, sortBy, sortOrder, updateUrlParams],
    );

    const handlePopState = useCallback(() => {
        const searchParams = new URL(window.location.href).searchParams;
        const page = Number(searchParams.get('page')) || 1;
        const perPageParam = Number(searchParams.get('per_page')) || 5;
        const sortByParam = (searchParams.get('sort_by') as BookSortBy) || BookSortBy.CREATED_AT;
        const sortOrderParam = (searchParams.get('sort_order') as BookSortOrder) || BookSortOrder.DESC;
        const searchParam = searchParams.get('q') || '';

        dispatch({ type: 'SET_PER_PAGE', payload: perPageParam });
        dispatch({
            type: 'SET_SORT',
            payload: {
                sortBy: sortByParam,
                sortOrder: sortOrderParam,
            },
        });

        if (searchParam) {
            dispatch({ type: 'SET_SEARCH_QUERY', payload: searchParam });
            dispatch({ type: 'SET_IS_SEARCHING', payload: true });
            searchBooks(searchParam, page, perPageParam, sortByParam, sortOrderParam);
        } else {
            dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
            dispatch({ type: 'SET_IS_SEARCHING', payload: false });
            fetchBooks(page, perPageParam, sortByParam, sortOrderParam);
        }
    }, [fetchBooks, searchBooks]);

    const handleClearSearch = useCallback(() => {
        if (isLoading) return;

        dispatch({ type: 'CLEAR_SEARCH' });

        updateUrlParams({
            q: '',
            page: '1',
            per_page: perPage.toString(),
            sort_by: sortBy,
            sort_order: sortOrder,
        });

        fetchBooks(1, perPage, sortBy, sortOrder);
    }, [fetchBooks, isLoading, perPage, sortBy, sortOrder, updateUrlParams]);

    useEffect(() => {
        const searchParams = new URL(window.location.href).searchParams;
        const initialPage = Number(searchParams.get('page')) || 1;
        const initialPerPage = Number(searchParams.get('per_page')) || 5;
        const initialSortBy = searchParams.get('sort_by') || 'created_at';
        const initialSortOrder = (searchParams.get('sort_order') as BookSortOrder) || 'desc';
        const initialSearchQuery = searchParams.get('q') || '';

        dispatch({ type: 'SET_PER_PAGE', payload: initialPerPage });
        dispatch({
            type: 'SET_SORT',
            payload: {
                sortBy: initialSortBy as BookSortBy,
                sortOrder: initialSortOrder as BookSortOrder,
            },
        });

        if (initialSearchQuery) {
            dispatch({ type: 'SET_SEARCH_QUERY', payload: initialSearchQuery });
            dispatch({ type: 'SET_IS_SEARCHING', payload: true });
            searchBooks(initialSearchQuery, initialPage, initialPerPage, initialSortBy as BookSortBy, initialSortOrder);
        } else {
            fetchBooks(initialPage, initialPerPage, initialSortBy as BookSortBy, initialSortOrder);
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [fetchBooks, searchBooks, handlePopState]);
    useEffect(() => {
        if (isInitialSearchRender.current) {
            isInitialSearchRender.current = false;
            return;
        }

        if (debouncedSearchQuery === '') {
            if (isSearching) {
                dispatch({ type: 'SET_IS_SEARCHING', payload: false });
                dispatch({ type: 'SET_SEARCH_COMPLETE', payload: false });

                updateUrlParams({
                    q: '',
                    page: '1',
                    per_page: perPage.toString(),
                    sort_by: sortBy,
                    sort_order: sortOrder,
                });

                fetchBooks(1, perPage, sortBy, sortOrder);
            }
            return;
        }
        if (debouncedSearchQuery.trim() === prevSearchQuery.current) {
            return;
        }
        prevSearchQuery.current = debouncedSearchQuery.trim();

        searchBooks(debouncedSearchQuery.trim(), 1, perPage, sortBy, sortOrder);
    }, [debouncedSearchQuery, fetchBooks, isSearching, perPage, searchBooks, sortBy, sortOrder, updateUrlParams]);

    return {
        books,
        meta,
        searchQuery,
        isSearching,
        isLoading,
        searchComplete,
        perPage,
        sortBy,
        sortOrder,
        perPageOptions,
        handleSearchInputChange,
        handleClearSearch,
        handlePageChange,
        handleSortChange,
        handlePerPageChange,
    };
}
