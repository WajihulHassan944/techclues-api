# API reference

The authoritative, always-current reference is the generated OpenAPI document:

- **Live, while the server is running**: `GET /api/docs` (Swagger UI), `GET /api/docs-json` (raw spec)
- **Exported snapshot**: [`openapi.json`](./openapi.json) in this repo (regenerate it any time by
  running the server and re-fetching `/api/docs-json` — see the one-liner below)

```bash
npm run build && node dist/main.js &
curl -s http://localhost:4000/api/docs-json -o openapi.json
```

For a human-readable summary of each endpoint grouped by feature, see the "Endpoints" section of
[`README.md`](./README.md).

## Error shape

Every error response (from `AllExceptionsFilter`) has this shape, regardless of status code:

```json
{
  "error": {
    "statusCode": 400,
    "message": "Human-readable message, or \"Validation failed\" for DTO errors",
    "details": ["array of field errors, only present for validation failures"],
    "path": "/api/public/contact",
    "timestamp": "2026-10-11T12:00:00.000Z"
  }
}
```

## Auth

- `POST /api/auth/login` returns `{ accessToken, email }` and sets an httpOnly `tc_refresh` cookie
  (`SameSite=None; Secure` in production, scoped to `/api/auth`).
- Send `Authorization: Bearer <accessToken>` on every `/api/admin/*` request.
- `POST /api/auth/refresh` reads the cookie and returns a new `accessToken` (and rotates the cookie).
- Access tokens expire in 15 minutes by default (`JWT_ACCESS_TTL`); the frontend should refresh
  proactively or retry once on a 401.
