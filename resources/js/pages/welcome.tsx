import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const [books, setbooks] = useState([]);

    useEffect(() => {
        fetch('/api/v1/books')
            .then((response) => response.json())
            .then((data) => {
                console.log('Books:', data);
                setbooks(data.data);
            })
            .catch((error) => {
                console.error('Error fetching books:', error);
            });
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
                    </div>
                </main>
            </div>
        </>
    );
}
