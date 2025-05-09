import { Head   } from '@inertiajs/react';

export default function Welcome() {

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="">
                <main className="flex text-white w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                    <h1>Hello world</h1>
                </main>
            </div>
        </>
    );
}
