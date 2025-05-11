import { AddBookModal, DeleteBookConfirmation, DownloadBooksModal } from '@/components';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useDebounce from '@/hooks/use-debounce';
import { BookSortBy, BookSortOrder } from '@/types';
import { Book, PaginationMeta } from '@/types/api';
import { Head } from '@inertiajs/react';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, PencilIcon, SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const highlightAnimationStyle = `
  @keyframes highlightPulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
  }

  .highlight-animation {
    animation: highlightPulse 2s ease-in-out 1;
    display: inline;
    white-space: nowrap;
    vertical-align: baseline;
  }

  mark {
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
`;

export default function Welcome() {
    const [books, setBooks] = useState<Book[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        current_page: 1,
        per_page: 5,
        total: 0,
        last_page: 1,
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    const [sortBy, setSortBy] = useState<BookSortBy>(BookSortBy.CREATED_AT);
    const [sortOrder, setSortOrder] = useState<BookSortOrder>(BookSortOrder.DESC);
    const [perPage, setPerPage] = useState<number>(5);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const perPageOptions = [5, 10, 20, 50, 100];
    const highlightSearchTerm = (text: string, searchTerm: string) => {
        if (!searchTerm || searchTerm.trim() === '' || !text) return text;

        try {
            const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

            return text.replace(
                regex,
                '<mark class="bg-yellow-200 dark:bg-amber-700 text-black dark:text-white highlight-animation" style="padding: 0; margin: 0; border-radius: 2px;">$1</mark>',
            );
        } catch (e) {
            console.error('Error highlighting search term:', e);
            return text;
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        fetchBooks(1, perPage, sortBy, sortOrder);
    };

    const fetchBooks = useCallback(
        (page: number = 1, itemsPerPage: number = perPage, sortColumn: string = sortBy, sortDirection: BookSortOrder = sortOrder) => {
            fetch(`/api/v1/books?page=${page}&per_page=${itemsPerPage}&sort_by=${sortColumn}&sort_order=${sortDirection}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Books:', data);
                    setBooks(data.data);
                    setMeta(data.meta || meta);
                    updateUrlParams({
                        page: page.toString(),
                        per_page: itemsPerPage.toString(),
                        sort_by: sortColumn,
                        sort_order: sortDirection,
                        q: '',
                    });
                })
                .catch((error) => {
                    console.error('Error fetching books:', error);
                });
        },
        [meta, sortBy, sortOrder, perPage],
    );

    const updateUrlParams = (params: Record<string, string>) => {
        const url = new URL(window.location.href);

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });

        window.history.pushState({}, '', url.toString());
    };
    const searchBooks = (
        query: string,
        page: number = 1,
        itemsPerPage: number = perPage,
        sortColumn: string = sortBy,
        sortDirection: string = sortOrder,
    ) => {
        setIsSearching(true);

        fetch(
            `/api/v1/books/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${itemsPerPage}&sort_by=${sortColumn}&sort_order=${sortDirection}`,
        )
            .then((response) => response.json())
            .then((data) => {
                console.log('Search results:', data);
                setBooks(data.data);
                setMeta(data.meta || meta);

                updateUrlParams({
                    q: query,
                    page: page.toString(),
                    per_page: itemsPerPage.toString(),
                    sort_by: sortColumn,
                    sort_order: sortDirection,
                });
            })
            .catch((error) => {
                console.error('Error searching books:', error);
            })
            .finally(() => {
                setIsSearching(false);
            });
    };
    const handlePageChange = (page: number) => {
        if (searchQuery) {
            searchBooks(searchQuery, page, perPage, sortBy, sortOrder);
        } else {
            fetchBooks(page, perPage, sortBy, sortOrder);
        }
    };
    const handleSortChange = (column: BookSortBy) => {
        let newColumn = column;
        let newOrder = BookSortOrder.ASC;

        if (sortBy === column) {
            if (sortOrder === BookSortOrder.ASC) {
                newOrder = BookSortOrder.DESC;
            } else {
                newColumn = BookSortBy.CREATED_AT;
                newOrder = BookSortOrder.DESC;
            }
        }

        setSortBy(newColumn);
        setSortOrder(newOrder);
        if (searchQuery) {
            searchBooks(searchQuery, 1, perPage, newColumn, newOrder);
        } else {
            fetchBooks(1, perPage, newColumn, newOrder);
        }
    };
    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);

        if (searchQuery) {
            searchBooks(searchQuery, 1, newPerPage, sortBy, sortOrder);
        } else {
            fetchBooks(1, newPerPage, sortBy, sortOrder);
        }
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        const urlPerPage = url.searchParams.get('per_page');
        const urlPage = url.searchParams.get('page');
        const urlSortBy = url.searchParams.get('sort_by');
        const urlSortOrder = url.searchParams.get('sort_order');
        const urlQuery = url.searchParams.get('q');

        const initialPerPage = urlPerPage ? parseInt(urlPerPage) : 5;
        const initialPage = urlPage ? parseInt(urlPage) : 1;
        const initialSortBy = (urlSortBy as BookSortBy) || BookSortBy.CREATED_AT;
        const initialSortOrder = (urlSortOrder as BookSortOrder) || BookSortOrder.DESC;
        const initialQuery = urlQuery || '';

        setPerPage(initialPerPage);
        setSortBy(initialSortBy);
        setSortOrder(initialSortOrder);
        setSearchQuery(initialQuery);

        if (initialQuery) {
            searchBooks(initialQuery, initialPage, initialPerPage, initialSortBy, initialSortOrder);
        } else {
            fetchBooks(initialPage, initialPerPage, initialSortBy, initialSortOrder);
        }
    }, []);

    useEffect(() => {
        if (debouncedSearchQuery) {
            searchBooks(debouncedSearchQuery, 1, perPage, sortBy, sortOrder);
        } else if (debouncedSearchQuery === '') {
            fetchBooks(1, perPage, sortBy, sortOrder);
        }
    }, [debouncedSearchQuery]);

    return (
        <>
            <Head title="Book List">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                <style>{highlightAnimationStyle}</style>
            </Head>
            <div className="p-8">
                <header className="flex items-center justify-end">
                    <AppearanceToggleDropdown />
                </header>
                <main className="w-full dark:text-white">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-4 flex flex-col gap-4">
                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <AddBookModal onBookAdded={() => fetchBooks()} />
                                    <DownloadBooksModal />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm">Items per page:</span>
                                    <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue placeholder="5" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {perPageOptions.map((option) => (
                                                <SelectItem key={option} value={option.toString()}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon className="text-muted-foreground h-4 w-4" />
                                </div>
                                <Input
                                    type="search"
                                    placeholder="Search by title or author..."
                                    className="focus:border-primary border-2 pr-10 pl-10 transition-all focus-visible:ring-1"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                />
                                {searchQuery && (
                                    <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleClearSearch}>
                                        <span className="text-muted-foreground hover:text-foreground text-xs">Clear</span>
                                    </button>
                                )}
                                {isSearching && (
                                    <div className="absolute top-1/2 right-12 -translate-y-1/2 transform">
                                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{searchQuery ? `Search results for "${searchQuery}"` : 'Books'}</h2>
                        </div>
                        <Table>
                            <TableCaption>
                                {isSearching ? 'Searching...' : searchQuery ? `Found ${meta.total} results for "${searchQuery}"` : 'List of Books'}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="hover:bg-accent/50 w-[350px] cursor-pointer"
                                        onClick={() => handleSortChange(BookSortBy.TITLE)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Title</span>
                                            {sortBy === 'title' ? (
                                                sortOrder === BookSortOrder.ASC ? (
                                                    <ArrowUpIcon className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownIcon className="h-4 w-4" />
                                                )
                                            ) : (
                                                <ArrowUpDownIcon className="h-4 w-4 opacity-50" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hover:bg-accent/50 w-[350px] cursor-pointer"
                                        onClick={() => handleSortChange(BookSortBy.AUTHOR)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Author</span>
                                            {sortBy === 'author' ? (
                                                sortOrder === BookSortOrder.ASC ? (
                                                    <ArrowUpIcon className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownIcon className="h-4 w-4" />
                                                )
                                            ) : (
                                                <ArrowUpDownIcon className="h-4 w-4 opacity-50" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-8 text-center">
                                            {isSearching
                                                ? 'Searching...'
                                                : searchQuery
                                                  ? 'No books found matching your search.'
                                                  : 'No books available.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    books.map((book) => {
                                        const { title, author, id } = book;
                                        return (
                                            <TableRow key={id}>
                                                <TableCell className="max-w-[350px] truncate font-medium">
                                                    {searchQuery ? (
                                                        <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(title, searchQuery) }} />
                                                    ) : (
                                                        title
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[350px] truncate">
                                                    {searchQuery ? (
                                                        <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(author, searchQuery) }} />
                                                    ) : (
                                                        author
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-1">
                                                        <AddBookModal
                                                            book={book}
                                                            isEditMode={true}
                                                            onBookUpdated={() =>
                                                                searchQuery
                                                                    ? searchBooks(searchQuery, meta.current_page, perPage, sortBy, sortOrder)
                                                                    : fetchBooks(meta.current_page, perPage, sortBy, sortOrder)
                                                            }
                                                            triggerButton={
                                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <DeleteBookConfirmation
                                                            bookId={id}
                                                            bookTitle={title}
                                                            onBookDeleted={() =>
                                                                searchQuery
                                                                    ? searchBooks(searchQuery, meta.current_page, perPage, sortBy, sortOrder)
                                                                    : fetchBooks(meta.current_page, perPage, sortBy, sortOrder)
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        {meta.total > 0 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-muted-foreground text-sm">
                                    Showing page {meta.current_page} of {meta.last_page} ({meta.total} items)
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(meta.current_page - 1)}
                                        disabled={meta.current_page === 1}
                                        className="cursor-pointer"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        {meta.last_page > 10 ? (
                                            <>
                                                <Button
                                                    key={1}
                                                    variant={meta.current_page === 1 ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    1
                                                </Button>

                                                {meta.current_page > 4 && <span className="mx-1">...</span>}

                                                {Array.from({ length: meta.last_page }).map((_, i) => {
                                                    const page = i + 1;
                                                    if (page > 1 && page < meta.last_page && Math.abs(page - meta.current_page) <= 2) {
                                                        return (
                                                            <Button
                                                                key={page}
                                                                variant={meta.current_page === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handlePageChange(page)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                {page}
                                                            </Button>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                                {meta.current_page < meta.last_page - 3 && <span className="mx-1">...</span>}
                                                <Button
                                                    key={meta.last_page}
                                                    variant={meta.current_page === meta.last_page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(meta.last_page)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {meta.last_page}
                                                </Button>
                                            </>
                                        ) : (
                                            [...Array(meta.last_page)].map((_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={meta.current_page === page ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                        className="h-8 w-8 cursor-pointer p-0"
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(meta.current_page + 1)}
                                        disabled={meta.current_page === meta.last_page}
                                        className="cursor-pointer"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
