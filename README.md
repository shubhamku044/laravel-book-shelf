# Laravel Book Shelf

A modern web application built with Laravel, React, and Inertia.js for managing your personal book collection.

## Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: React 19.x with TypeScript
- **UI Framework**: Tailwind CSS 4.x
- **Database**: SQLite
- **Development**: Docker
- **Testing**: Pest PHP

## Prerequisites

- Docker and Docker Compose
- Git
- Node.js 21.x (for local development)
- PHP 8.2+ (for local development)
- Composer (for local development)
- AWS CLI (for AWS deployment)
- GitHub Actions (for CI/CD)

## AWS Deployment

To deploy the application to AWS, you need to:

1. Set up an AWS account and create an ECS cluster
2. Create an ECR repository for your Docker images
3. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `AWS_REGION` - Your AWS region (e.g., us-east-1)
   - `AWS_ECS_CLUSTER` - Your ECS cluster name
   - `AWS_ECS_SERVICE` - Your ECS service name
   - `AWS_ECS_TASK_DEFINITION` - Your ECS task definition
   - `AWS_ECS_CONTAINER_NAME` - Your ECS container name
   - `SLACK_WEBHOOK_URL` (optional) - For Slack notifications
   - `SLACK_CHANNEL` (optional) - For Slack notifications

The deployment pipeline will automatically:
- Build and push Docker images to ECR
- Deploy to ECS
- Send notifications to Slack (if configured)

## Prerequisites

- Docker and Docker Compose
- Git
- Node.js 21.x (for local development)
- PHP 8.2+ (for local development)
- Composer (for local development)

## Local Development Setup

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd laravel-book-shelf
   ```

2. Create and configure your environment file:
   ```bash
   cp .env.example .env
   ```

3. Build and start the Docker containers:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

4. Install dependencies and set up the database:
   ```bash
   docker compose exec app composer install
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate
   ```

5. Access the application:
   - Main application: http://localhost:8080
   - Vite development server: http://localhost:5173

### Local Development (Without Docker)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd laravel-book-shelf
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. Set up the database:
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - Laravel server
   php artisan serve

   # Terminal 2 - Vite development server
   npm run dev
   ```

## Development Commands

- **Start development servers**:
  ```bash
  composer dev
  ```

- **Run tests**:
  ```bash
  composer test
  ```

- **Format code**:
  ```bash
  # PHP
  composer format

  # JavaScript/TypeScript
  npm run format
  ```

- **Lint code**:
  ```bash
  # PHP
  composer lint

  # JavaScript/TypeScript
  npm run lint
  ```

## Docker Commands

- **Start containers**:
  ```bash
  docker compose up -d
  ```

- **Stop containers**:
  ```bash
  docker compose down
  ```

- **View logs**:
  ```bash
  docker compose logs -f
  ```

- **Access container shell**:
  ```bash
  docker compose exec app sh
  ```

## Project Structure

- `app/` - Laravel application code
- `resources/` - Frontend assets and React components
- `routes/` - Application routes
- `database/` - Database migrations and seeders
- `tests/` - Application tests
- `docker/` - Docker configuration files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
