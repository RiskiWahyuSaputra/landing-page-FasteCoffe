<?php

namespace App\Http\Middleware;

use App\Models\AdminAccessToken;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAdminToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $plainTextToken = $request->bearerToken();

        if (! $plainTextToken) {
            return $this->unauthenticatedResponse();
        }

        $accessToken = AdminAccessToken::query()
            ->with('user')
            ->where('token', hash('sha256', $plainTextToken))
            ->first();

        if (! $accessToken || ! $accessToken->user || ! $accessToken->user->is_admin) {
            return $this->unauthenticatedResponse();
        }

        if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
            $accessToken->delete();

            return $this->unauthenticatedResponse();
        }

        $accessToken->forceFill([
            'last_used_at' => now(),
        ])->save();

        $request->attributes->set('adminToken', $accessToken);
        $request->setUserResolver(static fn () => $accessToken->user);

        return $next($request);
    }

    protected function unauthenticatedResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Token admin tidak valid atau sudah berakhir.',
        ], 401);
    }
}
