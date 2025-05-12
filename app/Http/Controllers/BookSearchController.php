<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookSearchController extends Controller
{
    /**
     * Search books by title or author.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        try {
            $validated = $request->validate([
                'q' => 'required|string|min:1|max:255',
                'per_page' => 'sometimes|integer|min:1|max:100',
                'sort_by' => 'sometimes|string|in:title,author,created_at,updated_at',
                'sort_order' => 'sometimes|string|in:asc,desc',
                'page' => 'sometimes|integer|min:1',
            ]);

            $query = $validated['q'];
            $perPage = $validated['per_page'] ?? 5;
            $sortBy = $validated['sort_by'] ?? 'created_at';
            $sortOrder = $validated['sort_order'] ?? 'desc';

            $books = Book::where('title', 'LIKE', "%{$query}%")
                ->orWhere('author', 'LIKE', "%{$query}%")
                ->orderBy($sortBy, $sortOrder)
                ->paginate($perPage);

            $meta = [
                'current_page' => $books->currentPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
                'last_page' => $books->lastPage(),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'query' => $query,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Search results retrieved successfully.',
                'data' => $books->items(),
                'meta' => $meta,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search books.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
