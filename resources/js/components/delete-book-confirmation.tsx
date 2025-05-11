import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface DeleteBookConfirmationProps {
    bookId: number;
    bookTitle: string;
    onBookDeleted?: () => void;
    triggerButton?: React.ReactNode;
}

export default function DeleteBookConfirmation({ bookId, bookTitle, onBookDeleted, triggerButton }: DeleteBookConfirmationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/v1/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete book');
            }

            // Close the dialog
            setIsOpen(false);

            // Notify parent component
            if (onBookDeleted) {
                onBookDeleted();
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8 w-8">
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-full max-w-md border-0 p-6">
                <DialogHeader className="mb-4 space-y-2 text-left">
                    <DialogTitle className="text-xl font-medium">Are you sure?</DialogTitle>
                    <DialogDescription className="text-sm">
                        This action will permanently delete the book "{bookTitle}". This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting} className="mt-0">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
