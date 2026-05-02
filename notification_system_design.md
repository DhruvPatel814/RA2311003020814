# Notification System Design

## Stage 1: API Design
- GET /notifications → Fetch notifications
- POST /notifications → Create notification
- PATCH /notifications/:id/read → Mark as read

## Stage 2: Database Design
Using MongoDB

Fields:
- id
- userId
- type
- message
- isRead
- createdAt

## Stage 3: Optimization
- Add index on (userId, isRead, createdAt)
- Improves query performance

## Stage 4: Scaling
- Use pagination
- Use caching (Redis)
- Lazy loading

## Stage 5: Fault Handling
- Use queue system (Kafka/RabbitMQ)
- Retry failed notifications