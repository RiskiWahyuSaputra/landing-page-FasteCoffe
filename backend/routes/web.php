<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'message' => 'Faste Coffee Admin API is running.',
        'docs' => [
            'health' => url('/up'),
            'admin_login' => url('/api/admin/login'),
        ],
    ]);
});
