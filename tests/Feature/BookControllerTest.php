<?php

namespace Tests\Feature;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BookControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test listing books with default pagination.
     */
    public function test_index_returns_paginated_books()
    {
        Book::factory()->count(10)->create();

        $response = $this->getJson('/api/v1/books');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'title', 'author', 'created_at', 'updated_at']
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                    'last_page',
                    'sort_by',
                    'sort_order',
                ]
            ])
            ->assertJsonCount(5, 'data')
            ->assertJson([
                'success' => true,
                'message' => 'Books retrieved successfully.',
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 5,
                    'sort_by' => 'created_at',
                    'sort_order' => 'desc',
                ]
            ]);
    }

    /**
     * Test listing books with custom pagination and sorting.
     */
    public function test_index_with_custom_parameters()
    {
        Book::factory()->count(20)->create();

        $response = $this->getJson('/api/v1/books?per_page=10&sort_by=title&sort_order=asc');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJson([
                'meta' => [
                    'per_page' => 10,
                    'sort_by' => 'title',
                    'sort_order' => 'asc',
                ]
            ]);
    }

    /**
     * Test listing books with invalid parameters.
     */
    public function test_index_with_invalid_parameters()
    {
        $response = $this->getJson('/api/v1/books?per_page=200&sort_by=invalid&sort_order=random');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['per_page', 'sort_by', 'sort_order']);
    }

    /**
     * Test storing a new book with valid data.
     */
    public function test_store_creates_new_book()
    {
        $bookData = [
            'title' => $this->faker->sentence(3),
            'author' => $this->faker->name,
        ];
        $response = $this->postJson('/api/v1/books', $bookData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Book created successfully.',
                'data' => $bookData
            ]);

        $this->assertDatabaseHas('books', $bookData);
    }

    /**
     * Test storing a book with missing required fields.
     */
    public function test_store_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/books', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'author']);
    }

    /**
     * Test storing a book with fields exceeding maximum length.
     */
    public function test_store_validates_field_lengths()
    {
        $bookData = [
            'title' => str_repeat('a', 300),
            'author' => str_repeat('b', 300),
        ];
        $response = $this->postJson('/api/v1/books', $bookData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'author']);
    }

    /**
     * Test retrieving a specific book.
     */
    public function test_show_returns_book()
    {
        $book = Book::factory()->create();
        $response = $this->getJson("/api/v1/books/{$book->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Book retrieved successfully.',
                'data' => [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                ]
            ]);
    }

    /**
     * Test retrieving a non-existent book.
     */
    public function test_show_returns_404_for_nonexistent_book()
    {
        $response = $this->getJson('/api/v1/books/999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Failed to retrieve book.',
            ]);
    }

    /**
     * Test updating a book with valid data.
     */
    public function test_update_modifies_book()
    {
        $book = Book::factory()->create();
        $updateData = [
            'title' => 'Updated Title',
            'author' => 'Updated Author',
        ];
        $response = $this->patchJson("/api/v1/books/{$book->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Book updated successfully.',
                'data' => $updateData
            ]);

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'title' => 'Updated Title',
            'author' => 'Updated Author',
        ]);
    }

    /**
     * Test updating a book with partial data.
     */
    public function test_update_with_partial_data()
    {
        $book = Book::factory()->create();
        $updateData = [
            'title' => 'Only Title Updated',
        ];
        $response = $this->patchJson("/api/v1/books/{$book->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'Only Title Updated',
                    'author' => $book->author,
                ]
            ]);

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'title' => 'Only Title Updated',
            'author' => $book->author,
        ]);
    }

    /**
     * Test updating a non-existent book.
     */
    public function test_update_returns_404_for_nonexistent_book()
    {
        $response = $this->patchJson('/api/v1/books/999', ['title' => 'New Title']);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Failed to update book.',
            ]);
    }

    /**
     * Test updating a book with invalid data.
     */
    public function test_update_validates_input()
    {
        $book = Book::factory()->create();
        $updateData = [
            'title' => str_repeat('a', 300),
            'author' => str_repeat('b', 300),
        ];

        $response = $this->patchJson("/api/v1/books/{$book->id}", $updateData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'author']);
    }

    /**
     * Test deleting a book.
     */
    public function test_destroy_deletes_book()
    {
        $book = Book::factory()->create();

        $response = $this->deleteJson("/api/v1/books/{$book->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Book deleted successfully.',
            ]);

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    /**
     * Test deleting a non-existent book.
     */
    public function test_destroy_returns_404_for_nonexistent_book()
    {
        $response = $this->deleteJson('/api/v1/books/999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Failed to delete book.',
            ]);
    }

    /**
     * Test bulk storing books.
     */
    public function test_bulk_store_creates_multiple_books()
    {
        $booksData = [
            'books' => [
                [
                    'title' => 'Book 1',
                    'author' => 'Author 1',
                ],
                [
                    'title' => 'Book 2',
                    'author' => 'Author 2',
                ],
            ]
        ];

        $response = $this->postJson('/api/v1/books/bulk', $booksData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Books created successfully.',
            ]);

        $this->assertDatabaseHas('books', ['title' => 'Book 1', 'author' => 'Author 1']);
        $this->assertDatabaseHas('books', ['title' => 'Book 2', 'author' => 'Author 2']);
    }

    /**
     * Test bulk storing with validation errors.
     */
    public function test_bulk_store_validates_input()
    {
        $booksData = [
            'books' => [
                [
                    'title' => '',
                    'author' => 'Author 1',
                ],
                [
                    'title' => 'Book 2',
                    'author' => '',
                ],
            ]
        ];

        $response = $this->postJson('/api/v1/books/bulk', $booksData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['books.0.title', 'books.1.author']);
    }

    /**
     * Test downloading books as CSV.
     */
    public function test_download_books_as_csv()
    {
        Book::factory()->count(3)->create();
        $downloadData = [
            'fields' => ['title', 'author'],
        ];

        $response = $this->postJson('/api/v1/books/download/csv', $downloadData);

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename=books-' . now()->format('Y-m-d') . '.csv');
    }

    /**
     * Test downloading books as XML.
     */
    public function test_download_books_as_xml()
    {
        Book::factory()->count(3)->create();
        $downloadData = [
            'fields' => ['title', 'author'],
        ];
        $response = $this->postJson('/api/v1/books/download/xml', $downloadData);

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/xml')
            ->assertHeader('Content-Disposition', 'attachment; filename=books-' . now()->format('Y-m-d') . '.xml');
    }

    /**
     * Test downloading books with invalid format.
     */
    public function test_download_with_invalid_format()
    {
        $downloadData = [
            'fields' => ['title', 'author'],
        ];
        $response = $this->postJson('/api/v1/books/download/invalid', $downloadData);
        $response->assertStatus(500);
    }

    /**
     * Test downloading books with missing fields.
     */
    public function test_download_validates_fields()
    {
        $response = $this->postJson('/api/v1/books/download/csv', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fields']);
    }

    /**
     * Test purging all books.
     */
    public function test_purge_deletes_all_books()
    {
        Book::factory()->count(5)->create();
        $this->assertDatabaseCount('books', 5);
        $this->app['env'] = 'testing';

        $response = $this->deleteJson('/api/v1/books/purge');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'All books deleted successfully',
                'deleted_count' => 5
            ]);

        $this->assertDatabaseCount('books', 0);
    }

    /**
     * Test purging books in production environment.
     */
    public function test_purge_is_disabled_in_production()
    {
        Book::factory()->count(5)->create();
        $this->app['env'] = 'production';

        $response = $this->deleteJson('/api/v1/books/purge');

        $response->assertStatus(500)
            ->assertJson([
                'success' => false,
                'message' => 'Failed to purge books',
                'error' => 'Bulk deletion is disabled in production'
            ]);

        $this->assertDatabaseCount('books', 5);
    }

    /**
     * Test searching books.
     */
    public function test_search_finds_books()
    {
        Book::factory()->create(['title' => 'Laravel Testing']);
        Book::factory()->create(['title' => 'Vue.js Basics']);
        Book::factory()->create(['author' => 'Laravel Author']);
        $response = $this->getJson('/api/v1/books/search?q=Laravel');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJson([
                'success' => true,
                'message' => 'Search results retrieved successfully.',
                'meta' => [
                    'query' => 'Laravel'
                ]
            ]);
    }

    /**
     * Test searching with pagination and sorting.
     */
    public function test_search_with_pagination_and_sorting()
    {
        for ($i = 0; $i < 10; $i++) {
            Book::factory()->create(['title' => "Laravel Book $i"]);
        }
        $response = $this->getJson('/api/v1/books/search?q=Laravel&per_page=5&sort_by=title&sort_order=asc');
        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJson([
                'meta' => [
                    'per_page' => 5,
                    'sort_by' => 'title',
                    'sort_order' => 'asc',
                ]
            ]);
    }

    /**
     * Test searching with missing query parameter.
     */
    public function test_search_validates_query_parameter()
    {
        $response = $this->getJson('/api/v1/books/search');
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['q']);
    }
}
