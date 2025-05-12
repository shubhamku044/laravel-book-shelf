<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookSearchController;
use App\Http\Controllers\BookExportController;
use App\Http\Controllers\BookBulkController;

Route::prefix('v1')->group(function () {
    // Search operations
    Route::get('/books/search', [BookSearchController::class, 'search']);

    // Export operations
    Route::post('/books/download/{format}', [BookExportController::class, 'download']);

    // Bulk operations
    Route::post('/books/bulk', [BookBulkController::class, 'bulkStore']);
    Route::delete('/books/purge', [BookBulkController::class, 'purge']);

    // Basic CRUD operations
    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::patch('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);
});
