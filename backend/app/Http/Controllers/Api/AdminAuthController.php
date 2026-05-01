<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAccessToken;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $credentials['email'])
            ->where('is_admin', true)
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password admin tidak valid.'],
            ]);
        }

        AdminAccessToken::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->delete();

        $plainTextToken = Str::random(80);

        $token = AdminAccessToken::query()->create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainTextToken),
            'expires_at' => now()->addDays(7),
            'last_used_at' => now(),
        ]);

        return response()->json([
            'message' => 'Login admin berhasil.',
            'token' => $plainTextToken,
            'user' => $this->serializeUser($user),
            'session' => [
                'issued_at' => $token->created_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => $this->serializeUser($user),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var AdminAccessToken|null $token */
        $token = $request->attributes->get('adminToken');

        return response()->json([
            'user' => $this->serializeUser($user),
            'stats' => [
                'total_users' => User::query()->count(),
                'total_admins' => User::query()->where('is_admin', true)->count(),
                'total_menu_items' => MenuItem::query()->count(),
                'active_admin_sessions' => AdminAccessToken::query()
                    ->where(function ($query): void {
                        $query->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })
                    ->count(),
                'backend_status' => 'online',
            ],
            'session' => [
                'issued_at' => $token?->created_at?->toIso8601String(),
                'last_used_at' => $token?->last_used_at?->toIso8601String(),
                'expires_at' => $token?->expires_at?->toIso8601String(),
            ],
            'meta' => [
                'app_name' => config('app.name'),
                'environment' => app()->environment(),
                'server_time' => now()->toIso8601String(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var AdminAccessToken|null $token */
        $token = $request->attributes->get('adminToken');

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Session admin berhasil diakhiri.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => (bool) $user->is_admin,
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
