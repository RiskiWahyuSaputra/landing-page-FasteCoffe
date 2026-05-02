---
name: laravel-nextjs-integration
description: Use when integrating a Next.js frontend with a Laravel backend, specifically for handling authentication, API calls, error propagation, and real-time events.
---

# Laravel-Next.js Integration

## Overview
Consistent integration between Next.js and Laravel requires standardized API wrappers, unified error handling, and robust real-time event management.

## When to Use
- Implementing new API service functions in `lib/laravel-admin-api.ts`
- Handling multipart/form-data with file uploads
- Propagating backend validation errors to the frontend
- Setting up real-time notifications via Laravel Echo/Reverb

## Core Patterns

### 1. API Service Wrapper (`callLaravel`)
Always use the `callLaravel` utility for standard JSON requests. It handles:
- Authorization header (Bearer token)
- JSON serialization
- Error extraction (first validation error)
- Status-aware exceptions (`LaravelApiError`)

### 2. Multipart Uploads & Method Spoofing
Laravel requires `_method: "PUT"` or `PATCH` when sending `multipart/form-data` via `POST`.

```typescript
export async function updateSomething(token: string, id: number, body: FormData) {
  // Method spoofing for Laravel multipart
  body.append("_method", "PUT"); 

  const response = await fetch(`${LARAVEL_API_URL}/endpoint/${id}`, {
    method: "POST", // Must be POST for FormData
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body,
    cache: "no-store",
  });
  // ... handle response and throw LaravelApiError
}
```

### 3. Error Propagation
Catch `LaravelApiError` in API routes or Server Actions and return a consistent JSON response.

```typescript
try {
  const result = await loginAdmin(email, password);
  // ... handle success
} catch (error) {
  if (error instanceof LaravelApiError) {
    return Response.json({ message: error.message }, { status: error.status });
  }
  return Response.json({ message: "An unexpected error occurred" }, { status: 500 });
}
```

### 4. Real-time Events (Reverb)
Use `getReverbEcho()` for client-side event listening. Always clean up listeners.
- **Event Names**: Use the dot prefix (`.EventName`) if the event name is the exact class name or if `broadcastAs()` is not used.
- **Cleanup**: Always `leaveChannel` and `stopListening` to avoid memory leaks.

```typescript
useEffect(() => {
  const echo = getReverbEcho();
  if (!echo) return;

  const channel = echo.channel("my-channel")
    .listen(".MyEvent", (data: any) => {
      // Handle data
    });

  return () => {
    channel.stopListening(".MyEvent");
    echo.leaveChannel("my-channel");
  };
}, []);
```

## Quick Reference
| Feature | Pattern | File/Utility |
|---------|---------|--------------|
| Auth | Bearer Token in Cookie | `lib/admin-auth.ts` |
| API | fetch wrapper | `callLaravel` |
| Real-time | Laravel Echo | `getReverbEcho()` |
| Errors | Custom Class | `LaravelApiError` |

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "I'll use PUT directly for files" | PHP/Laravel won't parse `multipart/form-data` on PUT. Use POST + `_method`. |
| "Accept header isn't needed" | Without it, Laravel might return a 302 redirect to the home page on errors. |
| "I'll listen for events globally" | Cleanup is mandatory to prevent duplicate listeners on route changes. |
| "I don't need the custom error class" | Consistency across the app breaks, and you lose status-code awareness. |

## Red Flags - STOP and Check
- Using `method: "PUT"` with `FormData`.
- Forgetting `body.append("_method", "PUT")`.
- Missing `Accept: "application/json"`.
- Listening for Echo events without a `useEffect` cleanup.
- Hardcoding the API URL instead of using `process.env.LARAVEL_API_URL`.

## Common Mistakes
- **Forgetting `Accept: application/json`**: Laravel might return HTML redirects instead of JSON errors.
- **Missing `_method` spoofing**: `PUT` requests with files will fail or lose data.
- **Server-side Echo**: Attempting to use `getReverbEcho` in Server Components (returns `null`).
- **Token context**: Passing the token from client-side state instead of secure cookies.
