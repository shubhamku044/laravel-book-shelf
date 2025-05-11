import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Book, PaginationMeta } from '@/types/api';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function Welcome() {
    const [books, setBooks] = useState<Book[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        current_page: 1,
        per_page: 5,
        total: 0,
        last_page: 1,
        sort_by: 'created_at',
        sort_order: 'desc'
    });

    const sortBy = 'created_at';
    const sortOrder = 'desc';
    const perPage = 5;

    const fetchBooks = useCallback((page: number = 1, itemsPerPage: number = perPage, sortColumn: string = sortBy, sortDirection: string = sortOrder) => {
        fetch(`/api/v1/books?page=${page}&per_page=${itemsPerPage}&sort_by=${sortColumn}&sort_order=${sortDirection}`)
            .then((response) => response.json())
            .then((data) => {
                console.log('Books:', data);
                setBooks(data.data);
                setMeta(data.meta || meta);
            })
            .catch((error) => {
                console.error('Error fetching books:', error);
            });
    }, [meta]);

    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="p-8">
                <header className="flex items-center justify-end">
                    <AppearanceToggleDropdown />
                </header>
                <main className="w-full dark:text-white">
                    <div className="mx-auto max-w-3xl">
                        <Table>
                            <TableCaption>List of Books</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Title</TableHead>
                                    <TableHead>Author</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.map((book) => {
                                    const { title, author, id } = book;
                                    return (
                                        <TableRow key={id}>
                                            <TableCell className="font-medium">{title}</TableCell>
                                            <TableCell>{author}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing page {meta.current_page} of {meta.last_page} ({meta.total} items)
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => console.log('Previous page')}
                                        disabled={meta.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        {meta.last_page > 10 ? (
                                            <>
                                                {/* First page */}
                                                <Button
                                                    key={1}
                                                    variant={meta.current_page === 1 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => console.log('First page')}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    1
                                                </Button>

                                                {/* Show ellipsis if current page is not near the start */}
                                                {meta.current_page > 4 && (
                                                    <span className="mx-1">...</span>
                                                )}

                                                {/* Pages around current page */}
                                                {Array.from({ length: meta.last_page }).map((_, i) => {
                                                    const page = i + 1;
                                                    // Show 2 pages before and after current page
                                                    if (
                                                        (page > 1 && page < meta.last_page) &&
                                                        (Math.abs(page - meta.current_page) <= 2)
                                                    ) {
                                                        return (
                                                            <Button
                                                                key={page}
                                                                variant={meta.current_page === page ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => console.log(`Page ${page}`)}
                                                                className="w-8 h-8 p-0"
                                                            >
                                                                {page}
                                                            </Button>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                                {meta.current_page < meta.last_page - 3 && (
                                                    <span className="mx-1">...</span>
                                                )}

                                                <Button
                                                    key={meta.last_page}
                                                    variant={meta.current_page === meta.last_page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => console.log('Last page')}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {meta.last_page}
                                                </Button>
                                            </>
                                        ) : (
                                            /* If 10 or fewer pages, show all page numbers */
                                            [...Array(meta.last_page)].map((_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={meta.current_page === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => console.log(`Page ${page}`)}
                                                        className="w-8 h-8 p-0"
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
                                        onClick={() => console.log('Next page')}
                                        disabled={meta.current_page === meta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                    </div>
                </main>
            </div>
        </>
    );
}
