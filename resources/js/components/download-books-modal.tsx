import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

interface DownloadBooksModalProps {
    onDownload?: () => void;
}

export default function DownloadBooksModal({ onDownload }: DownloadBooksModalProps) {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<'csv' | 'xml'>('csv');
    const [selectedFields, setSelectedFields] = useState<string[]>(['title', 'author']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFieldChange = (field: string) => {
        setSelectedFields((prevFields) => {
            if (prevFields.includes(field)) {
                return prevFields.filter((f) => f !== field);
            } else {
                return [...prevFields, field];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedFields.length === 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/v1/books/download/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    fields: selectedFields,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`);
            }

            const blob = await response.blob();

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `books-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setOpen(false);

            toast.success(`Books downloaded successfully in ${format.toUpperCase()} format`);

            if (onDownload) {
                onDownload();
            }
        } catch (error) {
            console.error('Error downloading books:', error);
            toast.error(`Error downloading books: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Download</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Download Books</DialogTitle>
                    <DialogDescription>Select format and fields to include in your download.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label className="text-left">Format</Label>
                        <RadioGroup className="flex gap-6" value={format} onValueChange={(value: 'csv' | 'xml') => setFormat(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="csv-format" value="csv" />
                                <Label htmlFor="csv-format">CSV</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="xml-format" value="xml" />
                                <Label htmlFor="xml-format">XML</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-left">Fields</Label>
                        <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="title" checked={selectedFields.includes('title')} onCheckedChange={() => handleFieldChange('title')} />
                                <Label htmlFor="title">Title</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="author"
                                    checked={selectedFields.includes('author')}
                                    onCheckedChange={() => handleFieldChange('author')}
                                />
                                <Label htmlFor="author">Author</Label>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting || selectedFields.length === 0}>
                        {isSubmitting ? 'Downloading...' : 'Download'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
