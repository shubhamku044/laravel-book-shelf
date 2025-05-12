import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NotFound() {
    // Add page title
    useEffect(() => {
        document.title = 'Page Not Found - Book Shelf';
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4">
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-9xl font-extrabold text-gray-700 dark:text-gray-300 tracking-widest">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                        Page Not Found
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        The page you are looking for is unavailable.
                    </p>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-2 rounded-md"
                        >
                            Go Home
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
