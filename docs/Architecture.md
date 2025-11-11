# 01Blog Architecture

## Backend (Spring Boot + JPA)
- Layers:
  - Controller: API endpoints
  - Service: Business logic + media upload handling
  - Repository: JPA repositories for PostgreSQL entities
  - Entity: Data models
  - Security: JWT + Spring Security

- MinIO handles media (images, videos, audio)
- PostgreSQL stores metadata via JPA entities

## Frontend (Angular)
- Modules:
  - AuthModule: login/register
  - UserModule: profiles, subscriptions
  - PostModule: create/edit/delete posts
  - NotificationModule: notifications
  - ReportModule: report content
  - AdminModule: admin dashboard
  - SharedModule: navbar, spinner, toast

- Media handling:
  - Upload via file input → backend → MinIO
  - URLs stored in database → displayed in UI
