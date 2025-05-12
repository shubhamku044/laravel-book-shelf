import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Head } from '@inertiajs/react';
import { BookList } from '../components/books/BookList';

export default function BookListPage() {
    return (
        <>
            <Head title="Book List">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="p-4 md:p-8">
                <header className="mb-4 flex items-center justify-end">
                    <AppearanceToggleDropdown />
                </header>
                <main className="w-full dark:text-white">
                    <BookList />
                </main>
            </div>
        </>
    );
}
