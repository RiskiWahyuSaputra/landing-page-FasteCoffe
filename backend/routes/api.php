<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{order}', [OrderController::class, 'show']);

Route::prefix('admin')->group(function (): void {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware('admin.token')->group(function (): void {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::get('/dashboard', [AdminAuthController::class, 'dashboard']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/menu-items', [MenuItemController::class, 'adminIndex']);
        Route::get('/orders', [OrderController::class, 'adminIndex']);
        Route::get('/orders/export', [OrderController::class, 'exportOrders']);
        Route::get('/orders/export-pdf', [OrderController::class, 'exportPdf']);
        Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::delete('/orders/{order}/payment-proof', [OrderController::class, 'destroyPaymentProof']);
        Route::post('/menu-items', [MenuItemController::class, 'store']);
        Route::post('/menu-items/{menuItem}', [MenuItemController::class, 'update']);
        Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy']);
    });
});
Route::options('/{any}', function () {
    return response()->json([], 204);
})->where('any', '.*');