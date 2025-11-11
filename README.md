# 01Blog

01Blog is a social blogging platform for students to share their learning journey, discoveries, and progress. Users can create posts, follow other students, like/comment on posts, and report inappropriate content. Administrators can moderate content and manage users.

## Tech Stack
- Backend: **Spring Boot + JPA (Hibernate)**
- Frontend: **Angular**
- Database: **PostgreSQL**
- Media Storage: **MinIO** (open-source S3-compatible object storage)
- Authentication: **JWT + Spring Security**

## Features
- User authentication and role-based access (User/Admin)
- Post creation with text, images, videos, and media preview
- Comments and likes
- Follow/unfollow users
- Notifications for new posts and interactions
- Reporting inappropriate content
- Admin dashboard for moderation
- Future-ready chat with audio support

## Full Project Visual Tree
```tree
01Blog
├── Frontend (Angular)
│   └── Modules/Components as listed above
├── Backend (Spring Boot + JPA)
│   ├── Controllers
│   ├── Services (PostService, UserService, ChatService, MinioService)
│   ├── Repositories (JPA)
│   └── Security (JWT + roles)
├── Database (PostgreSQL via JPA)
│   └── Entities: User, Post, Comment, Like, Subscription, Notification, Report, Message
└── Media Storage (MinIO)
    └── Bucket: 01blog (Images, Videos, Audio)
        └── URLs stored in DB
```
## Documentation Links 
- [Architecture Overview](docs/Architecture.md)
- [API Documentation](docs/API-reference.md)
- [Database Schema(JPA Entities)](docs/Database-schema(JPA).md)
- [Roadmap](docs/Roadmap.md)
- [Modules Overview](docs/Modules.md)

## Getting Started
1. Clone the repository
2. Set up environment variables in `.env` file by copying `.env.example` then modifying as needed
3. Run makefile commands: 
    - `make help` - Show available commands
4. After running make help, you can use the following commands to manage the application:
    - Database:
        - `make db-up`       - Start PostgreSQL
        - `make db-down`     - Stop PostgreSQL
        - `make db-logs`     - Show DB logs
        - `make db-shell`    - Connect to DB shell
        
    - MinIO:
        - `make minio-up`    - Start MinIO
        - `make minio-down`  - Stop MinIO
        - `make minio-logs`  - Show MinIO logs

    - App:
        - `make run`         - Run backend locally
        - `make build`       - Build backend
        - `make clean`       - Clean build
        - `make test`        - Run tests
    
    - Docker Compose Stack:
        - `make compose-up`      - Start all containers
        - `make compose-down`    - Stop all containers
        - `make compose-logs`    - View logs
        - `make compose-restart` - Restart all containers

    - Utility:
        - `make env-check`   - Check environment variables
        - `make status`      - Check system status
## Accessing the Application
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8000/api`
- MinIO Console: `http://localhost:9001` (default user/pass from .env)
- PostgreSQL: Connect via `jdbc:postgresql://localhost:<DB_PORT>/<DB_NAME>` using credentials from .env

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details
## Acknowledgements
- Inspired by various open-source projects and tutorials on building social platforms with Spring Boot and Angular.
## Contact
For questions or support, please contact [fihry](mailto:fihrylara@gmail.com).