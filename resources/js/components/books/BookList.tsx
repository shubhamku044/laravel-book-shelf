import { AddBookModal, DeleteBookConfirmation, DownloadBooksModal } from '@/components';
import { Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookSortBy, BookSortOrder } from '@/types';
import { Book } from '@/types/api';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, PencilIcon, SearchIcon } from 'lucide-react';
import { useBookList } from '../../hooks/useBookList';
import { useSearchHighlight } from '../../hooks/useSearchHighlight';

export function BookList() {
    const {
        books,
        meta,
        searchQuery,
        isSearching,
        searchComplete,
        sortBy,
        sortOrder,
        perPageOptions,
        handleSearchInputChange,
        handleClearSearch,
        handlePageChange,
        handleSortChange,
        handlePerPageChange,
    } = useBookList();

    const { highlightSearchTerm, highlightAnimationStyle } = useSearchHighlight();
    return (
        <div className="mx-auto max-w-3xl">
            <style>{highlightAnimationStyle}</style>
            <div className="mb-4 flex flex-col gap-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="flex flex-wrap gap-2">
                        <AddBookModal onBookAdded={() => handlePageChange(1)} />
                        <DownloadBooksModal />
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-muted-foreground text-sm">Rows per page</p>
                        <Select
                            value={String(meta.per_page)}
                            onValueChange={(value) => {
                                const numValue = Number(value);
                                handlePerPageChange(numValue);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={meta.per_page} />
                            </SelectTrigger>
                            <SelectContent>
                                {perPageOptions.map((pageSize) => (
                                    <SelectItem key={pageSize} value={String(pageSize)}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="relative">
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
                </div>
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{searchQuery.trim() ? `Search results for "${searchQuery.trim()}"` : 'Books'}</h2>
                </div>

                {books.length === 0 && !isSearching && searchQuery.trim() !== '' ? (
                    <div className="my-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <div className="bg-muted mb-4 rounded-full p-3">
                            <SearchIcon className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No books found</h3>
                        <p className="text-muted-foreground mb-4 text-sm">
                            No books matching "{searchQuery}" were found. Try a different search term or clear the search.
                        </p>
                        <Button onClick={handleClearSearch} variant="outline" size="sm">
                            Clear Search
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableCaption>
                                {isSearching ? (
                                    <div className="flex items-center justify-center">
                                        <span className="mr-2">Searching...</span>
                                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                    </div>
                                ) : searchQuery.trim() ? (
                                    `Found ${meta.total} results for "${searchQuery.trim()}"`
                                ) : (
                                    'List of Books'
                                )}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="hover:bg-accent/50 w-[40%] cursor-pointer"
                                        onClick={() => handleSortChange(BookSortBy.TITLE)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Title</span>
                                            {sortBy === BookSortBy.TITLE ? (
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
                                        className="hover:bg-accent/50 w-[40%] cursor-pointer"
                                        onClick={() => handleSortChange(BookSortBy.AUTHOR)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Author</span>
                                            {sortBy === BookSortBy.AUTHOR ? (
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
                                    <TableHead className="w-[20%] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-8 text-center">
                                            {isSearching ? (
                                                <div className="flex items-center justify-center">
                                                    <span className="mr-2">Searching...</span>
                                                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                                </div>
                                            ) : searchComplete && searchQuery.trim() ? (
                                                <div>
                                                    <p className="font-medium">No books found matching "{searchQuery.trim()}"</p>
                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                        Try a different search term or clear the search.
                                                    </p>
                                                </div>
                                            ) : (
                                                'No books available.'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    books.map((book: Book) => {
                                        const { title, author, id } = book;
                                        return (
                                            <TableRow key={id}>
                                                <TableCell className="max-w-[40%] truncate font-medium">
                                                    {searchQuery.trim() ? (
                                                        <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(title, searchQuery.trim()) }} />
                                                    ) : (
                                                        title
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[40%] truncate">
                                                    {searchQuery.trim() ? (
                                                        <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(author, searchQuery.trim()) }} />
                                                    ) : (
                                                        author
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-1">
                                                        <AddBookModal
                                                            book={book}
                                                            isEditMode={true}
                                                            onBookUpdated={() => handlePageChange(meta.current_page)}
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
                                                                handlePageChange(
                                                                    books.length === 1 && meta.current_page > 1
                                                                        ? meta.current_page - 1
                                                                        : meta.current_page,
                                                                )
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
                    </div>
                )}
                {books.length === 0 && <p className="py-4 text-center">No books found.</p>}
                {books.length > 0 && <Pagination meta={meta} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
}
