# API Endpoints

## Auth
- POST /auth/register
- POST /auth/login

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

## Notifications
- GET /notifications
- PUT /notifications/{id}/read

## Reports
- POST /reports/user/{id}
- POST /reports/post/{id}
- GET /admin/reports

## Admin
- GET /admin/users
- DELETE /admin/users/{id}
- GET /admin/posts
- DELETE /admin/posts/{id}
- GET /admin/analytics

## Chat (future)
- GET /chats/{chat_id}/messages
- POST /chats/{chat_id}/messages (supports text/audio/video)
