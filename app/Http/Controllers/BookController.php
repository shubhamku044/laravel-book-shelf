<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $books = Book::all();
            return response()->json([
                'success' => true,
                'message' => 'Books retrieved successfully.',
                'data' => $books,
            ], 200);
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
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
        ], [
            'title.required' => 'The title field is required.',
            'author.required' => 'The author field is required.',
            'title.string' => 'The title must be a string.',
            'author.string' => 'The author must be a string.',
        ]);
        try {
            $book = Book::create($validated);
            return response()->json([
                'success' => true,
                'message' => 'Book created successfully.',
                'data' => $book,
            ], 201);
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $book = Book::findOrFail($id);
            $book->update($request->only(['title', 'author']));
            return response()->json([
                'success' => true,
                'message' => 'Book updated successfully.',
                'data' => $book,
            ], 200);
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete book.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
