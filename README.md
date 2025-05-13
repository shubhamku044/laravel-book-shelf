# Laravel Book Shelf

A modern web application built with Laravel, React, and Inertia.js for managing your personal book collection.

## Architecture Diagram
![Architecture Diagram](image.png)

### Architecture Explanation

The Laravel Book Shelf application follows a modern single-page application architecture with server-side rendering capabilities. Here's a breakdown of each component:

#### Backend Layer
- **Laravel Backend**: Serves as the core application server, handling API requests, authentication, and business logic
- **Database (SQLite)**: Stores book information, user data, and application state
- **API Routes**: RESTful endpoints for CRUD operations on books

#### Integration Layer
- **Inertia.js**: Bridges the gap between Laravel and React, allowing server-side rendering while maintaining a SPA experience
- **Data Flow**: Server-rendered initial page loads with client-side navigation for subsequent interactions

#### Frontend Layer
- **React Components**: Built with TypeScript for type safety and better developer experience
- **UI Framework**: Uses Shadcn UI components built on Tailwind CSS for a consistent, responsive design
- **State Management**: Local React state for component-level state, with Inertia handling page-level state

#### Key UI Components
- **Book List**: Displays all books with sorting and filtering capabilities
- **Add/Edit Modal**: Form for creating new books or editing existing ones
- **Delete Dialog**: Confirmation dialog for book deletion with toast notifications
- **Toast Notifications**: Sonner-based toast system for user feedback
- **404 Page**: Custom animated page for handling unknown routes

#### Data Flow
1. User interacts with the React UI
2. Inertia.js handles client-side navigation and server requests
3. Laravel processes requests and interacts with the SQLite database
4. Response data is sent back to the client
5. React updates the UI based on the new data

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
   git clone https://github.com/shubhamku044/laravel-book-shelf.git
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
   git clone https://github.com/shubhamku044/laravel-book-shelf.git
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
   chmod 666 database/database.sqlite  # Set proper write permissions
   php artisan migrate
   ```

6. Start the development servers:
   ```bash
   # Single command to start both Laravel and Vite servers
   composer run dev
   ```

## Development Commands

- **Run tests (optional)**:
  ```bash
  composer test
  ```

- **Format frontend code (optional)**:
  ```bash
  npm run format
  ```

- **Lint frontend code (optional)**:
  ```bash
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

## Project Structure

- `app/` - Laravel application code
- `resources/` - Frontend assets and React components
- `routes/` - Application routes
- `database/` - Database migrations and seeders
- `tests/` - Application tests
