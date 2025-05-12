<?php

namespace Tests\Unit;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the Book model has the correct fillable attributes.
     */
    public function test_fillable_attributes()
    {
        $book = new Book();
        
        $this->assertEquals([
            'title',
            'author',
        ], $book->getFillable());
    }

    /**
     * Test creating a book with factory.
     */
    public function test_can_create_book()
    {
        $book = Book::factory()->create();
        
        $this->assertInstanceOf(Book::class, $book);
        $this->assertNotNull($book->id);
        $this->assertNotNull($book->title);
        $this->assertNotNull($book->author);
        $this->assertNotNull($book->created_at);
        $this->assertNotNull($book->updated_at);
    }

    /**
     * Test retrieving a book.
     */
    public function test_can_retrieve_book()
    {
        $book = Book::factory()->create();
        
        $retrievedBook = Book::find($book->id);
        
        $this->assertEquals($book->id, $retrievedBook->id);
        $this->assertEquals($book->title, $retrievedBook->title);
        $this->assertEquals($book->author, $retrievedBook->author);
    }

    /**
     * Test updating a book.
     */
    public function test_can_update_book()
    {
        $book = Book::factory()->create();
        
        $book->update([
            'title' => 'Updated Title',
            'author' => 'Updated Author',
        ]);
        
        $this->assertEquals('Updated Title', $book->title);
        $this->assertEquals('Updated Author', $book->author);
        
        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'title' => 'Updated Title',
            'author' => 'Updated Author',
        ]);
    }

    /**
     * Test deleting a book.
     */
    public function test_can_delete_book()
    {
        $book = Book::factory()->create();
        $bookId = $book->id;
        
        $book->delete();
        
        $this->assertDatabaseMissing('books', ['id' => $bookId]);
        $this->assertNull(Book::find($bookId));
    }

    /**
     * Test filtering books by title.
     */
    public function test_can_filter_by_title()
    {
        Book::factory()->create(['title' => 'Laravel Testing']);
        Book::factory()->create(['title' => 'Vue.js Basics']);
        Book::factory()->create(['title' => 'Advanced Laravel']);
        
        $books = Book::where('title', 'like', '%Laravel%')->get();
        
        $this->assertCount(2, $books);
        $this->assertTrue($books->contains('title', 'Laravel Testing'));
        $this->assertTrue($books->contains('title', 'Advanced Laravel'));
    }
    
    /**
     * Test filtering books by author.
     */
    public function test_can_filter_by_author()
    {
        Book::factory()->create(['author' => 'John Doe']);
        Book::factory()->create(['author' => 'Jane Smith']);
        Book::factory()->create(['author' => 'John Smith']);
        
        $books = Book::where('author', 'like', '%John%')->get();
        
        $this->assertCount(2, $books);
        $this->assertTrue($books->contains('author', 'John Doe'));
        $this->assertTrue($books->contains('author', 'John Smith'));
    }
}
