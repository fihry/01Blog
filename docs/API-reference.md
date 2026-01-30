# API Endpoints

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

## Users
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
 (file cleaned to remove duplicated content and ensure a single, canonical API reference)
## User
- GET /users/{id}
- PUT /users/{id}
- POST /users/{id}/subscribe
- DELETE /users/{id}/unsubscribe

## Posts
- GET /posts
- POST /posts (supports MultipartFile for media)
- PUT /posts/{id}
- DELETE /posts/{id}
- POST /posts/{id}/like
- POST /posts/{id}/comment

### Base path
All endpoints below are mounted under the API base: `/api` — e.g. `GET /api/posts`.

### Authentication
- Every protected endpoint requires the `Authorization` header with a valid JWT:
	- `Authorization: Bearer <token>`

### GET /api/posts
- Description: List posts (paginated). Returns a Page of `PostDto` objects ordered by `createdAt` desc.
- Example curl:
```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/posts"
```

### GET /api/posts/{postId}
- Description: Get a single post by UUID.
- Path param: `postId` (UUID)
- Example curl:
```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/posts/<POST_ID>"
```

### POST /api/posts
- Description: Create a new post. Uses `multipart/form-data` so you can upload files.
- Form parts:
	- `post` (required) — JSON string matching `PostCreateDto`:
		- `title` (string, 10-100 chars)
		- `content` (string, 100-10000 chars)
		- optional `tags` array (if your client sends tags)
	- `media` (optional) — one or more file parts (images/videos). The controller accepts `media` as a list of multipart files.
- Validation:
	- `title`: required, min 10, max 100
	- `content`: required, min 100, max 10_000
	- Media content types: image/* or video/* (audio and other types rejected)
- Example curl (multipart):
```bash
curl -v -X POST "http://localhost:8000/api/posts" \
	-H "Authorization: Bearer $TOKEN" \
	-F 'post={"title":"My Post Title","content":"Long content... (>=100 chars)"};type=application/json' \
	-F "media=@/path/to/image.jpg"
```

Example JS (node-fetch + form-data) — same approach used in `test/test.js`:
```js
const FormData = require('form-data');
const form = new FormData();
form.append('post', JSON.stringify({ title: '...', content: '...'}), { contentType: 'application/json' });
form.append('media', fs.createReadStream('/path/to/image.jpg'));
fetch('http://localhost:8000/api/posts', { method: 'POST', headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() }, body: form })
```

### PUT /api/posts/{postId}
- Description: Update an existing post. Request is `multipart/form-data` and supports the same `post` JSON part and optional `media` files.
- Only the post author may update the post (403 otherwise).
- If `media` parts are provided, old media will be deleted and replaced.
- Example curl:
```bash
curl -v -X PUT "http://localhost:8000/api/posts/<POST_ID>" \
	-H "Authorization: Bearer $TOKEN" \
	-F 'post={"title":"Updated title","content":"Updated long content..."};type=application/json' \
	-F "media=@/path/to/new-image.jpg"
```

### DELETE /api/posts/{postId}
- Description: Delete a post. Only the author may delete. Returns HTTP 204 on success.
- Example curl:
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/posts/<POST_ID>"
```

### POST /api/posts/{postId}/like
- Description: Toggle or create a like for the current user (depending on implementation). Returns 200 with status.
- Example curl:
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/posts/<POST_ID>/like"
```

### POST /api/posts/{postId}/comment
- Description: Create a comment on a post. Body: JSON `{ "content": "comment text" }`.
- Example curl:
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
	-d '{"content":"Nice post!"}' "http://localhost:8000/api/posts/<POST_ID>/comment"
```

### PostDto (response shape)
Responses for post endpoints return a `PostDto` with the following fields:
- `id` (UUID)
- `title` (string)
- `content` (string)
- `media` (array of MediaDto: `{ id, mediaUrl, mediaType }`)
- `author` (UserSummaryDto: `{ id, username, avatarUrl }`)
- `createdAt`, `updatedAt` (timestamps)
- `likeCount` (int)
- `commentCount` (int)
- `likedByCurrentUser` (boolean)



## Notifications
- GET /notifications
- PUT /notifications/{id}/read

## Reports
- POST /report
- GET /admin/reports
- DELETE /admin/reports/{id}

## Admin
- GET /admin/users
- DELETE /admin/users/{id}
- GET /admin/posts
- DELETE /admin/posts/{id}
- GET /admin/analytics

## Chat (future)
- GET /chats/{chat_id}/messages
- POST /chats/{chat_id}/messages (supports text/audio/video)
