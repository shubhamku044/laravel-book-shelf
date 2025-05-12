<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;

Route::prefix('v1')->group(function () {
    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/search', [BookController::class, 'search']);
    Route::post('/books/download/{format}', [BookController::class, 'download']);
    Route::post('/books/bulk', [BookController::class, 'bulkStore']);
    Route::delete('/books/purge', [BookController::class, 'purge']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::patch('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);
});
