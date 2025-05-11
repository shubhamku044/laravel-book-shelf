import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Book, PaginationMeta } from '@/types/api';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, PencilIcon } from 'lucide-react';
import { BookSortBy, BookSortOrder } from '@/types';
import { DeleteBookConfirmation, AddBookModal } from '@/components';

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

    const perPageOptions = [5, 10, 20, 50, 100];

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
    const handlePageChange = (page: number) => {
        fetchBooks(page, perPage, sortBy, sortOrder);
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
        fetchBooks(1, perPage, newColumn, newOrder);
    };
    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        fetchBooks(1, newPerPage, sortBy, sortOrder);
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        const urlPerPage = url.searchParams.get('per_page');
        const urlPage = url.searchParams.get('page');
        const urlSortBy = url.searchParams.get('sort_by');
        const urlSortOrder = url.searchParams.get('sort_order');

        const initialPerPage = urlPerPage ? parseInt(urlPerPage) : 5;
        const initialPage = urlPage ? parseInt(urlPage) : 1;
        const initialSortBy = (urlSortBy as BookSortBy) || BookSortBy.CREATED_AT;
        const initialSortOrder = (urlSortOrder as BookSortOrder) || BookSortOrder.DESC;

        setPerPage(initialPerPage);
        setSortBy(initialSortBy);
        setSortOrder(initialSortOrder);
        fetchBooks(initialPage, initialPerPage, initialSortBy, initialSortOrder);
    }, []);

    return (
        <>
            <Head title="Book List">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="p-8">
                <header className="flex items-center justify-end">
                    <AppearanceToggleDropdown />
                </header>
                <main className="w-full dark:text-white">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-4 flex flex-col gap-4">
                            <div className="flex justify-between">
                                <div>
                                    <AddBookModal onBookAdded={() => fetchBooks()} />
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
                        </div>
                        <Table>
                            <TableCaption>List of Books</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hover:bg-accent/50 w-[350px] cursor-pointer" onClick={() => handleSortChange(BookSortBy.TITLE)}>
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
                                    <TableHead className="hover:bg-accent/50 w-[350px] cursor-pointer" onClick={() => handleSortChange(BookSortBy.AUTHOR)}>
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
                                {books.map((book) => {
                                    const { title, author, id } = book;
                                    return (
                                            <TableRow key={id}>
                                                <TableCell className="max-w-[350px] truncate font-medium">
                                                    {title}
                                                </TableCell>
                                                <TableCell className="max-w-[350px] truncate">
                                                    {author}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-1">
                                                        <AddBookModal
                                                            book={book}
                                                            isEditMode={true}
                                                            onBookUpdated={() =>
fetchBooks(meta.current_page, perPage, sortBy, sortOrder)
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
fetchBooks(meta.current_page, perPage, sortBy, sortOrder)
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                    );
                                })}
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
