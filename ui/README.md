# GitHub ReBAC System - UI

Modern React-based user interface for the GitHub ReBAC System.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 Authentication & Authorization
- 📦 Repository Management
- 👥 Team Management
- 🔀 Pull Request Management (Coming Soon)
- 🔍 Permission Visualization (Coming Soon)
- 📊 Audit Log (Coming Soon)
- 🤖 AI-Powered Features

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the ui directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
│   ├── common/      # Common UI components
│   └── layout/      # Layout components
├── contexts/        # React contexts
├── pages/           # Page components
├── types/           # TypeScript types
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Usage

### Login

1. Navigate to `/login`
2. Enter your email, first name, and last name
3. Click "Sign In"

### Managing Repositories

- View all repositories on the dashboard or `/repositories`
- Create new repository with the "New Repository" button
- Click on a repository to view details
- Add collaborators and manage access

### Managing Teams

- View all teams on `/teams`
- Create new team with the "New Team" button
- Click on a team to view details
- Add members and grant repository access

## Development

### Running the Backend

Make sure the backend API is running:

```bash
cd ../
npm run dev
```

The backend should be accessible at `http://localhost:3000`

### Running the UI

```bash
npm run dev
```

The UI will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Features Status

- ✅ Authentication
- ✅ Dashboard
- ✅ Repository Management
- ✅ Team Management
- ⏳ Pull Request Management
- ⏳ Permission Visualization
- ⏳ Audit Log
- ⏳ AI Features Integration

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
