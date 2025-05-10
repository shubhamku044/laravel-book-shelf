<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
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
            return response()->json([
                'success' => true,
                'message' => 'Books retrieved successfully.',
                'data' => $books->items(),
                'meta' => [
                    'current_page' => $books->currentPage(),
                    'per_page' => $books->perPage(),
                    'total' => $books->total(),
                    'last_page' => $books->lastPage(),
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
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
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
        ], [
            'title.string' => 'The title must be a string.',
            'author.string' => 'The author must be a string.',
            'title.max' => 'The title may not be longer than 255 characters.',
            'author.max' => 'The author name may not be longer than 255 characters.',
        ]);
        try {
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
                'message' => 'Book not found.',
                'error' => 'Resource not found',
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
                'message' => "Successfully created {$createdCount} books.",
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
    private function generateCsv($books, $fields, $filename)
    {
        // Set headers for CSV download
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        // Stream CSV directly to output
        return response()->stream(
            function () use ($books, $fields) {
                $handle = fopen('php://output', 'w');

                // Add CSV header row
                fputcsv($handle, $fields);

                // Add data rows
                foreach ($books as $book) {
                    fputcsv($handle, $book->only($fields));
                }

                fclose($handle);
            },
            200,
            $headers
        );
    }
    private function generateXml($books, $fields, $filename)
    {
        // Create XML root element
        $xml = new \SimpleXMLElement('<books/>');

        // Add book entries
        foreach ($books as $book) {
            $bookNode = $xml->addChild('book');
            foreach ($fields as $field) {
                // Escape special characters and add field
                $bookNode->addChild($field, htmlspecialchars($book->$field));
            }
        }

        // Set headers and return XML
        return response($xml->asXML())
            ->header('Content-Type', 'application/xml')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
    private function formatResponse($format, $books, $fields, $filename)
    {
        // 1. Check the requested format
        switch (strtolower($format)) {
            case 'csv':
                return $this->generateCsv($books, $fields, $filename);
            case 'xml':
                return $this->generateXml($books, $fields, $filename);
            default:
                // 2. Handle invalid formats
                throw new \InvalidArgumentException('Unsupported format');
        }
    }

    public function download($format)
    {
        try {
            // Validate request body parameters
            $validated = request()->validate([
                'fields' => 'required|array|min:1',
                'fields.*' => 'in:title,author,created_at' // Allowed fields
            ]);

            // Get selected fields from request body
            $fields = $validated['fields'];
            $books = Book::select($fields)->get();

            // Generate filename
            $filename = 'books-' . now()->format('Y-m-d') . '.' . $format;

            return $this->formatResponse($format, $books, $fields, $filename);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Download failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
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
