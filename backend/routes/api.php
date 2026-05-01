<?php

use App\Http\Controllers\Api\AdminAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function (): void {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware('admin.token')->group(function (): void {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::get('/dashboard', [AdminAuthController::class, 'dashboard']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
    });
});
