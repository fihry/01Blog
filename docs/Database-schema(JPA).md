# PostgreSQL Schema (via JPA)

## Users
- Fields: id, username, email, password, role, bio, avatar_url
- Relationships: 
  - @OneToMany: posts
  - @OneToMany: comments
  - @ManyToMany: subscriptions

## Posts
- Fields: id, user_id, title, content, created_at, updated_at
- Relationships: 
  - @ManyToOne: user
  - @OneToMany: media
  - @OneToMany: comments
  - @OneToMany: likes

## Media
- Fields: id, post_id, media_url, media_type, created_at
- Relationships:
  - @ManyToOne: post

## Comments
- Fields: id, post_id, user_id, content, created_at
- Relationships:
  - @ManyToOne: post
  - @ManyToOne: user

## Likes
- Fields: id, post_id, user_id
- Relationships:
  - @ManyToOne: post
  - @ManyToOne: user

## Subscriptions
- follower_id, following_id
- @ManyToMany: user → user

## Notifications
- id, user_id, type, message, read, created_at

## Reports
- id, reporter_id, target_id, type, reason, created_at, status

## Messages (future chat + audio)
- id, chat_id, sender_id, message_text
- media_url (image/video/audio)
- media_type ('image','video','audio')
- created_at
