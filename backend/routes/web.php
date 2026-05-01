<?php

use Illuminate\Support\Facades\Route;

function frontendAdminUrl(?string $path = null): string
{
    $baseUrl = rtrim(env('FRONTEND_URL', 'http://127.0.0.1:3000'), '/');
    $adminPath = $path ? '/admin/' . ltrim($path, '/') : '/admin/login';

    return $baseUrl . $adminPath;
}

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

Route::get('/admin/{path?}', function (?string $path = null) {
    return redirect()->away(frontendAdminUrl($path));
})->where('path', '.*');
