import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useEffect, useState } from 'react';

interface Book {
    id: number;
    title: string;
    author: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface AddBookModalProps {
    book?: Book;
    onBookAdded?: () => void;
    onBookUpdated?: () => void;
    buttonLabel?: string;
    isEditMode?: boolean;
    triggerButton?: React.ReactNode;
}

export default function AddBookModal({
    book,
    onBookAdded,
    onBookUpdated,
    buttonLabel = 'Add New Book',
    isEditMode = false,
    triggerButton,
}: AddBookModalProps) {
    const { showToast, ToastContainer } = useToast();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [errors, setErrors] = useState<{ title?: string; author?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialValues, setInitialValues] = useState({ title: '', author: '' });

    // Set initial values when book prop changes or when editing mode changes
    useEffect(() => {
        if (book && isEditMode) {
            setTitle(book.title);
            setAuthor(book.author);
            setInitialValues({ title: book.title, author: book.author });
        } else {
            setTitle('');
            setAuthor('');
            setInitialValues({ title: '', author: '' });
        }
    }, [book, isEditMode]);

    const hasChanged = () => {
        return title !== initialValues.title || author !== initialValues.author;
    };

    const validateForm = () => {
        const newErrors: { title?: string; author?: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.length > 255) {
            newErrors.title = 'Title cannot exceed 255 characters';
        }

        if (!author.trim()) {
            newErrors.author = 'Author is required';
        } else if (author.length > 255) {
            newErrors.author = 'Author cannot exceed 255 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // In edit mode, if nothing changed, don't submit
        if (isEditMode && !hasChanged()) {
            setOpen(false);
            return;
        }

        setIsSubmitting(true);

        try {
            const url = isEditMode && book ? `/api/v1/books/${book.id}` : '/api/v1/books';

            const method = isEditMode ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title,
                    author,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors({
                        title: data.errors.title?.[0],
                        author: data.errors.author?.[0],
                    });
                    return;
                }

                if (data.isDuplicate) {
                    showToast(data.error || 'A book with the same title and author already exists.', 'warning');
                    return;
                }

                throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'add'} book`);
            }

            setTitle('');
            setAuthor('');
            setErrors({});
            setOpen(false);

            if (isEditMode && onBookUpdated) {
                onBookUpdated();
            } else if (!isEditMode && onBookAdded) {
                onBookAdded();
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} book:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{triggerButton || <Button>{buttonLabel}</Button>}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update the details of this book.' : 'Enter the details of the book you want to add to your collection.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-left">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter book title"
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="author" className="text-left">
                                Author
                            </Label>
                            <Input
                                id="author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Enter author name"
                                className={errors.author ? 'border-red-500' : ''}
                            />
                            {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || (isEditMode && !hasChanged())}>
                            {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Book' : 'Add Book'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </>
    );
}
