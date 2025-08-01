# Malware Scanner Backend

A production-grade malware scanning simulation platform built with Node.js, TypeScript, Express, MongoDB, and RabbitMQ.

## 🏗️ Architecture

- **Node.js + Express.js**: RESTful API server
- **TypeScript**: Type safety and scalability
- **MongoDB**: Metadata storage with Mongoose ODM
- **RabbitMQ**: Message broker for background job processing
- **Redis**: Caching and session management (optional)
- **Winston**: Structured logging
- **Multer**: File upload handling
- **Helmet**: Security middleware
- **Rate Limiting**: Express rate limiting

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts      # MongoDB connection
│   │   └── rabbitmq.ts      # RabbitMQ connection
│   ├── controllers/
│   │   ├── fileController.ts # File upload/management
│   │   └── scanController.ts # Scan operations
│   ├── middleware/
│   │   └── errorHandler.ts   # Error handling
│   ├── models/
│   │   └── File.ts          # MongoDB schema
│   ├── routes/
│   │   ├── fileRoutes.ts    # File endpoints
│   │   ├── scanRoutes.ts    # Scan endpoints
│   │   └── healthRoutes.ts  # Health checks
│   ├── services/
│   │   ├── fileService.ts   # File operations
│   │   └── scanService.ts   # Scan operations
│   ├── utils/
│   │   ├── logger.ts        # Winston logger
│   │   └── scanner.ts       # Malware detection
│   ├── workers/
│   │   └── scanWorker.ts    # Background job processor
│   └── app.ts              # Express app entry
├── uploads/                # File storage
├── logs/                  # Application logs
├── Dockerfile            # Production container
├── package.json
├── tsconfig.json
└── env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- RabbitMQ 3.12+
- Redis 7+ (optional)

### Local Development

1. **Clone and install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start dependencies (using Docker)**

   ```bash
   # Start MongoDB and RabbitMQ
   docker-compose up mongodb rabbitmq redis -d
   ```

4. **Run the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

### Docker Deployment

1. **Start the complete stack**

   ```bash
   docker-compose up -d
   ```

2. **Access the services**
   - API: http://localhost:3001
   - RabbitMQ Management: http://localhost:15672 (admin/password123)
   - MongoDB: localhost:27017

## 🔧 Configuration

### Environment Variables

| Variable       | Description           | Default                                     |
| -------------- | --------------------- | ------------------------------------------- |
| `NODE_ENV`     | Environment           | `development`                               |
| `PORT`         | Server port           | `3001`                                      |
| `MONGODB_URI`  | MongoDB connection    | `mongodb://localhost:27017/malware-scanner` |
| `RABBITMQ_URL` | RabbitMQ connection   | `amqp://localhost:5672`                     |
| `REDIS_URL`    | Redis connection      | `redis://localhost:6379`                    |
| `LOG_LEVEL`    | Logging level         | `info`                                      |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000`                     |

## 📡 API Endpoints

### File Management

- `POST /api/files/upload` - Upload file for scanning
- `GET /api/files` - Get all files (with pagination)
- `GET /api/files/:id` - Get file by ID
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/stats/overview` - Get file statistics

### Scan Operations

- `GET /api/scans/status/:id` - Get scan status
- `GET /api/scans/history` - Get scan history
- `GET /api/scans/stats` - Get scan statistics
- `POST /api/scans/initiate/:id` - Initiate scan
- `POST /api/scans/rescan/:id` - Rescan file

### Health Checks

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health with dependencies
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## 🔍 Malware Detection

The scanner simulates malware detection using:

- **File Extension Analysis**: Checks for suspicious extensions
- **MIME Type Validation**: Validates file types
- **Content Analysis**: Scans for malware keywords and patterns
- **Size Validation**: Checks file size limits
- **Pattern Detection**: Identifies base64, hex, URL patterns

### Detection Features

- Keyword-based detection
- Pattern matching
- File type validation
- Size-based analysis
- Confidence scoring
- Threat categorization

## 📊 Monitoring & Logging

### Logging

- **Winston**: Structured JSON logging
- **File Rotation**: Automatic log rotation
- **Error Tracking**: Comprehensive error handling
- **Request Logging**: All API requests logged

### Health Monitoring

- **Health Checks**: `/api/health` endpoints
- **Dependency Monitoring**: MongoDB, RabbitMQ status
- **Memory Usage**: Process memory tracking
- **Uptime Monitoring**: Application uptime

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **File Validation**: Upload security
- **Input Sanitization**: Request validation
- **Error Handling**: Secure error responses

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Scale backend
docker-compose up -d --scale backend=3
```

### Environment Setup

1. **Production Environment**

   ```bash
   NODE_ENV=production
   LOG_LEVEL=warn
   ```

2. **Security Configuration**

   ```bash
   # Use strong passwords
   MONGODB_URI=mongodb://user:password@host:port/db
   RABBITMQ_URL=amqp://user:password@host:port
   ```

3. **SSL/TLS Configuration**
   - Configure nginx reverse proxy
   - Set up SSL certificates
   - Enable HTTPS

### Performance Optimization

- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for session/data caching
- **Load Balancing**: Multiple backend instances
- **File Storage**: Efficient file handling

## 🧪 Testing

### Manual Testing

```bash
# Test file upload
curl -X POST -F "file=@test.txt" http://localhost:3001/api/files/upload

# Test scan status
curl http://localhost:3001/api/scans/status/{fileId}

# Test health check
curl http://localhost:3001/api/health
```

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Upload file
curl -X POST \
  -F "file=@sample.txt" \
  http://localhost:3001/api/files/upload

# Get scan status
curl http://localhost:3001/api/scans/status/{fileId}

# Get statistics
curl http://localhost:3001/api/scans/stats
```

## 📈 Scaling

### Horizontal Scaling

- **Multiple Backend Instances**: Load balancer
- **Database Replication**: MongoDB replica sets
- **Message Queue Clustering**: RabbitMQ clustering
- **Redis Clustering**: Redis sentinel/cluster

### Vertical Scaling

- **Resource Allocation**: CPU/Memory optimization
- **Database Optimization**: Indexing, query optimization
- **Caching Strategy**: Redis caching layers
- **File Storage**: CDN integration

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **RabbitMQ Connection Failed**

   - Verify RabbitMQ service
   - Check credentials
   - Ensure port 5672 is accessible

3. **File Upload Errors**

   - Check file size limits
   - Verify file type restrictions
   - Ensure upload directory permissions

4. **Scan Jobs Not Processing**
   - Check worker status
   - Verify queue connectivity
   - Check worker logs

### Log Analysis

```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View worker logs
docker-compose logs -f backend
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
