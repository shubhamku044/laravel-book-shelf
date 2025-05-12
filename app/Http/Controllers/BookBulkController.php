<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookBulkController extends Controller
{
    /**
     * Store multiple books at once.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'books' => 'required|array|min:1',
                'books.*.title' => 'required|string|max:255',
                'books.*.author' => 'required|string|max:255'
            ], [
                'books.*.title.required' => 'Each book must have a title',
                'books.*.author.required' => 'Each book must have an author',
            ]);

            DB::beginTransaction();

            $createdCount = Book::insert($validated['books']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Books created successfully.',
                'count' => $createdCount
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create books',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete all books (only in non-production environments).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function purge()
    {
        try {
            if (app()->isProduction()) {
                throw new \Exception('Bulk deletion is disabled in production');
            }

            $deletedCount = Book::count();

            Book::truncate();

            return response()->json([
                'success' => true,
                'message' => 'All books deleted successfully',
                'deleted_count' => $deletedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to purge books',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
