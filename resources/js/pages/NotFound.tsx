import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function NotFound() {
    // Add page title
    useEffect(() => {
        document.title = 'Page Not Found - Book Shelf';
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-gray-900">
            <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-9xl font-extrabold tracking-widest text-gray-700 dark:text-gray-300">404</h1>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                    <h1 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">Page Not Found</h1>

                    <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">The page you are looking for is unavailable.</p>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => (window.location.href = '/')} className="rounded-md px-6 py-2">
                            Go Home
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
