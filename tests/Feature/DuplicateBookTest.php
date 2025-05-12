<?php

namespace Tests\Feature;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DuplicateBookTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a duplicate book is detected when adding a book with the same title and author.
     *
     * @return void
     */
    public function test_duplicate_book_detection()
    {
        // Create a book
        $bookData = [
            'title' => 'Test Book Title',
            'author' => 'Test Author',
        ];

        // First attempt should succeed
        $response = $this->postJson('/api/v1/books', $bookData);
        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Book created successfully.',
        ]);

        // Verify the book was created
        $this->assertDatabaseHas('books', $bookData);

        // Second attempt with the same data should fail with a duplicate error
        $duplicateResponse = $this->postJson('/api/v1/books', $bookData);
        $duplicateResponse->assertStatus(422);
        $duplicateResponse->assertJson([
            'success' => false,
            'message' => 'Duplicate book entry',
            'isDuplicate' => true,
        ]);

        // Verify that only one book with these details exists
        $this->assertEquals(1, Book::where('title', $bookData['title'])
            ->where('author', $bookData['author'])
            ->count());
    }

    /**
     * Test that a book with the same title but different author is not considered a duplicate.
     *
     * @return void
     */
    public function test_same_title_different_author_not_duplicate()
    {
        // Create a book
        $bookData = [
            'title' => 'Common Book Title',
            'author' => 'First Author',
        ];

        // First book
        $response = $this->postJson('/api/v1/books', $bookData);
        $response->assertStatus(201);

        // Second book with same title but different author
        $secondBookData = [
            'title' => 'Common Book Title',
            'author' => 'Second Author',
        ];

        $secondResponse = $this->postJson('/api/v1/books', $secondBookData);
        $secondResponse->assertStatus(201);
        $secondResponse->assertJson([
            'success' => true,
            'message' => 'Book created successfully.',
        ]);

        // Verify both books exist
        $this->assertDatabaseHas('books', $bookData);
        $this->assertDatabaseHas('books', $secondBookData);
    }

    /**
     * Test that a book with the same author but different title is not considered a duplicate.
     *
     * @return void
     */
    public function test_same_author_different_title_not_duplicate()
    {
        // Create a book
        $bookData = [
            'title' => 'First Book Title',
            'author' => 'Common Author',
        ];

        // First book
        $response = $this->postJson('/api/v1/books', $bookData);
        $response->assertStatus(201);

        // Second book with different title but same author
        $secondBookData = [
            'title' => 'Second Book Title',
            'author' => 'Common Author',
        ];

        $secondResponse = $this->postJson('/api/v1/books', $secondBookData);
        $secondResponse->assertStatus(201);
        $secondResponse->assertJson([
            'success' => true,
            'message' => 'Book created successfully.',
        ]);

        // Verify both books exist
        $this->assertDatabaseHas('books', $bookData);
        $this->assertDatabaseHas('books', $secondBookData);
    }
}
