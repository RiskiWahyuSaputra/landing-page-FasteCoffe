<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\MenuItemController;
use Illuminate\Support\Facades\Route;

Route::get('/menu-items', [MenuItemController::class, 'index']);

Route::prefix('admin')->group(function (): void {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware('admin.token')->group(function (): void {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::get('/dashboard', [AdminAuthController::class, 'dashboard']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/menu-items', [MenuItemController::class, 'adminIndex']);
        Route::post('/menu-items', [MenuItemController::class, 'store']);
        Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy']);
    });
});
