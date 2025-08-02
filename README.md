# CyborgXplore Malware Scanner

A full-stack malware scanning application with a React frontend and Node.js backend, featuring real-time file scanning, queue-based processing, and comprehensive logging.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Cache**: Redis (optional)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized deployment)
- **Git**

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the entire application is using Docker Compose:

### 1. Clone the repository

```bash
git clone <repository-url>
cd CyborgXplore_Assignment
```

### 2. Start all services

```bash
docker-compose up -d
```

This will start:

- MongoDB database (port 27017)
- RabbitMQ message broker (port 5672, management UI on 15672)
- Redis cache (port 6379)
- Backend API server (port 3001)
- Nginx reverse proxy (port 80)

### 3. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **RabbitMQ Management**: http://localhost:15672 (admin/password123)

### 4. Stop all services

```bash
docker-compose down
```

## 🛠️ Manual Setup (Development)

If you prefer to run the services manually for development:

### Backend Setup

1. **Navigate to server directory**

```bash
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://admin:password123@localhost:27017/malware-scanner?authSource=admin
RABBITMQ_URL=amqp://admin:password123@localhost:5672
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB and RabbitMQ**
   You can use Docker to run just the required services:

```bash
docker-compose up -d mongodb rabbitmq redis
```

5. **Run the backend**

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

### Frontend Setup

1. **Navigate to client directory**

```bash
cd client
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## 📁 Project Structure

```
CyborgXplore_Assignment/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── context/      # React context
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── workers/      # Background workers
│   │   └── utils/        # Utility functions
│   ├── uploads/          # File upload directory
│   └── package.json
├── docker-compose.yml     # Docker services configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `REDIS_URL`: Redis connection string (optional)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)
- `FRONTEND_URL`: Frontend URL for CORS

#### Frontend

The frontend automatically connects to the backend API. If you change the backend port, update the API base URL in `client/src/services/api.js`.

### Database Setup

The application uses MongoDB with the following default configuration:

- **Database**: malware-scanner
- **Username**: admin
- **Password**: password123
- **Port**: 27017

### Message Queue Setup

RabbitMQ is configured with:

- **Username**: admin
- **Password**: password123
- **Port**: 5672
- **Management UI**: http://localhost:15672

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## 📊 Monitoring

### Logs

- Backend logs are stored in `server/logs/`
- Docker logs: `docker-compose logs -f [service-name]`

### Health Checks

- Backend health: `GET http://localhost:3001/api/health`
- Docker health checks are configured for all services

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Build and start in production mode
docker-compose -f docker-compose.yml up -d --build
```

### Manual Deployment

1. Build the frontend:

```bash
cd client
npm run build
```

2. Build the backend:

```bash
cd server
npm run build
```

3. Set production environment variables
4. Use a process manager like PM2 for the backend
5. Serve the frontend build files with a web server

## 🔒 Security Features

- **Rate Limiting**: Express rate limiting on API endpoints
- **Helmet**: Security headers middleware
- **CORS**: Configured for frontend domain
- **File Upload Validation**: File type and size restrictions
- **Input Validation**: Request validation middleware

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 27017, 5672 are available
2. **Database connection**: Check MongoDB is running and credentials are correct
3. **RabbitMQ connection**: Verify RabbitMQ service is running
4. **File uploads**: Ensure uploads directory has proper permissions

### Logs

Check logs for detailed error information:

```bash
# Docker logs
docker-compose logs -f backend

# Application logs
tail -f server/logs/combined.log
```

## 📝 API Documentation

### Endpoints

- `GET /api/health` - Health check
- `POST /api/files/upload` - Upload file for scanning
- `GET /api/scans` - Get scan history
- `GET /api/scans/:id` - Get scan details
- `GET /api/files/:id` - Get file details

### File Upload

- **Supported formats**: PDF, DOC, DOCX, TXT
- **Max file size**: 10MB
- **Scan timeout**: 30 seconds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs
3. Create an issue in the repository

---

**Note**: This is a malware scanning application. Always ensure you have proper security measures in place when handling potentially malicious files.
