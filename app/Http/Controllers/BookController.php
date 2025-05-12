<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'per_page' => 'sometimes|integer|min:1|max:100',
                'sort_by' => 'sometimes|string|in:title,author,created_at,updated_at',
                'sort_order' => 'sometimes|string|in:asc,desc',
            ]);
            $perPage = $validated['per_page'] ?? 5;
            $sortBy = $validated['sort_by'] ?? 'created_at';
            $sortOrder = $validated['sort_order'] ?? 'desc';

            $books = Book::orderBy($sortBy, $sortOrder)
                ->paginate($perPage);
            
            $meta = [
                'current_page' => $books->currentPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
                'last_page' => $books->lastPage(),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Books retrieved successfully.',
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
                'message' => 'Failed to retrieve books.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
            ], [
                'title.required' => 'The title field is required.',
                'author.required' => 'The author field is required.',
                'title.string' => 'The title must be a string.',
                'author.string' => 'The author must be a string.',
                'title.max' => 'The title may not be longer than 255 characters.',
                'author.max' => 'The author name may not be longer than 255 characters.',
            ]);
            
            $book = Book::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Book created successfully.',
                'data' => $book,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create book.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        try {
            $book = Book::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Book retrieved successfully.',
                'data' => $book,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book.',
                'error' => 'Book not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'author' => 'sometimes|string|max:255',
            ], [
                'title.string' => 'The title must be a string.',
                'author.string' => 'The author must be a string.',
                'title.max' => 'The title may not be longer than 255 characters.',
                'author.max' => 'The author name may not be longer than 255 characters.',
            ]);
            
            $book = Book::findOrFail($id);
            $book->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Book updated successfully.',
                'data' => $book,
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update book.',
                'error' => 'Book not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update book.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        try {
            $book = Book::findOrFail($id);
            $book->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Book deleted successfully.',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete book.',
                'error' => 'Book not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete book.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
