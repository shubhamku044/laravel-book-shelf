<?php

namespace Tests\Unit;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_valid_book_instances()
    {
        $book = Book::factory()->create();
        $this->assertNotNull($book->id);
        $this->assertNotNull($book->title);
        $this->assertNotNull($book->author);
    }

    /**
     * Test that the factory allows overriding attributes.
     */
    public function test_can_override_attributes()
    {
        $book = Book::factory()->create([
            'title' => 'Custom Title',
            'author' => 'Custom Author',
        ]);
        $this->assertEquals('Custom Title', $book->title);
        $this->assertEquals('Custom Author', $book->author);
    }

    /**
     * Test that the factory can create multiple books.
     */
    public function test_can_create_multiple_books()
    {
        $books = Book::factory()->count(5)->create();
        $this->assertCount(5, $books);
        $this->assertDatabaseCount('books', 5);
    }

    /**
     * Test that the factory creates books with valid data types.
     */
    public function test_creates_books_with_valid_data_types()
    {
        $book = Book::factory()->create();
        $this->assertIsInt($book->id);
        $this->assertIsString($book->title);
        $this->assertIsString($book->author);
    }
}
