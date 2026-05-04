---
name: integrating-laravel-nextjs
description: Use when building features that require communication between a Next.js frontend and a Laravel API, handling validation errors, or implementing real-time updates with Reverb.
---

# Integrating Laravel with Next.js

## Overview
Standardized integration between Next.js and Laravel ensures type-safe API communication, unified error handling, and robust real-time event management.

## When to Use
- Implementing or updating API service functions in `lib/laravel-admin-api.ts`.
- Handling complex form data including file uploads (`multipart/form-data`).
- Displaying backend validation errors to the frontend.
- Connecting to Laravel Reverb for real-time notifications or state updates.
- Encountering 302 redirects instead of JSON responses from the backend.

## Core Patterns

### 1. Unified API Wrapper (`callLaravel`)
Always use the `callLaravel` utility. It handles:
- Authorization headers (`Bearer` token from cookies).
- JSON serialization and content-type headers.
- Automatic error extraction (prioritizing validation errors).
- Status-aware exception throwing (`LaravelApiError`).

### 2. Multipart Uploads & Method Spoofing
Laravel requires `_method: "PUT"` or `PATCH` inside a `FormData` object only if you are targeting a `PUT` or `PATCH` route in `api.php`. If the route is `Route::post()`, spoofing is not needed.

```typescript
export async function updateSomething(token: string, id: number, body: FormData) {
  // Use _method ONLY if the backend route is Route::put() or Route::patch()
  body.append("_method", "PUT"); 

  const response = await fetch(`${process.env.LARAVEL_API_URL}/endpoint/${id}`, {
    method: "POST", // Must always be POST for FormData with files
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body,
    cache: "no-store",
  });
}
```

### 3. Error Propagation Strategy
Catch `LaravelApiError` in Server Actions or API routes to maintain consistency.

```typescript
try {
  await loginAdmin(email, password);
} catch (error) {
  if (error instanceof LaravelApiError) {
    // Return structured error for the UI
    return { error: error.message, status: error.status };
  }
  throw error; // Re-throw unexpected system errors
}
```

### 4. Real-time Listening (Echo/Reverb)
Use `getReverbEcho()` for client-side listeners. **Always clean up.**
- **Event Names**: If using `broadcastAs()`, use the exact name. Otherwise, prefix with a dot (`.MyEvent`) to avoid namespace auto-prefixing.
- **Cleanup**: `leaveChannel` and `stopListening` are mandatory in `useEffect` returns.

## Quick Reference
| Feature | Pattern | File/Utility |
|---------|---------|--------------|
| Authentication | Bearer Token | `lib/admin-auth.ts` |
| API Calls | fetch wrapper | `callLaravel` |
| Real-time | Laravel Echo | `getReverbEcho()` |
| Errors | Custom Class | `LaravelApiError` |

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "I'll use PUT directly for files" | Browsers and PHP/Laravel won't parse `multipart/form-data` on native `PUT`. Use `POST` + `_method`. |
| "Accept header isn't needed" | Without `Accept: application/json`, Laravel returns 302/HTML on errors (breaking the fetch). |
| "I'll listen for events globally" | Cleanup is mandatory; duplicate listeners cause memory leaks and UI glitches. |
| "Hardcoding URL is faster" | Breaks production/CI environments. Always use `process.env.LARAVEL_API_URL`. |

## Red Flags - STOP and Check
- Using `method: "PUT"` with `FormData`.
- Forgetting `body.append("_method", "PUT")` for a `PUT` route.
- Missing `Accept: "application/json"`.
- Listening for Echo events without a `useEffect` cleanup.
- Hardcoding the API URL.

## Common Mistakes
- **HTML Redirects on Error**: Caused by missing `Accept: application/json`.
- **Empty PUT Body**: Caused by sending `multipart/form-data` via native `PUT` instead of `POST` + `_method`.
- **Double Listeners**: Caused by missing `channel.stopListening()` in cleanup.
- **Client-side Reverb in SSR**: Attempting to use `getReverbEcho` in Server Components.
