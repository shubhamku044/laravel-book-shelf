import { Head   } from '@inertiajs/react';

export default function Welcome() {

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex text-white w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <h1>
                            Hello world
                        </h1>
                    </main>
                </div>
            </div>
        </>
    );
}
