<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookExportController extends Controller
{
    /**
     * Download books in the specified format.
     *
     * @param string $format
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\Response
     */
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

    /**
     * Format the response based on the requested format.
     *
     * @param string $format
     * @param \Illuminate\Database\Eloquent\Collection $books
     * @param array $fields
     * @param string $filename
     * @return \Illuminate\Http\Response
     * @throws \InvalidArgumentException
     */
    private function formatResponse($format, $books, $fields, $filename)
    {
        switch ($format) {
            case 'csv':
                return $this->generateCsv($books, $fields, $filename);
            case 'xml':
                return $this->generateXml($books, $fields, $filename);
            default:
                // Handle invalid formats
                throw new \InvalidArgumentException('Unsupported format');
        }
    }

    /**
     * Generate CSV response for books.
     *
     * @param \Illuminate\Database\Eloquent\Collection $books
     * @param array $fields
     * @param string $filename
     * @return \Illuminate\Http\Response
     */
    private function generateCsv($books, $fields, $filename)
    {
        // Set headers for CSV download
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=' . $filename,
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

    /**
     * Generate XML response for books.
     *
     * @param \Illuminate\Database\Eloquent\Collection $books
     * @param array $fields
     * @param string $filename
     * @return \Illuminate\Http\Response
     */
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
            ->header('Content-Disposition', 'attachment; filename=' . $filename);
    }
}
