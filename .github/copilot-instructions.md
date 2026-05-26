## Welcome to Starbound!

This document provides instructions for AI coding agents to effectively contribute to the Starbound codebase.

### Big Picture

Starbound is a full-stack eCommerce platform with a monorepo structure.

-   **Backend**: A [Django REST Framework](https://www.django-rest-framework.org/) application located in the `backend/` directory. It serves a RESTful API for all application data.
-   **Frontend**: A [Next.js](https://nextjs.org/) application located in the `frontend/` directory. It's built with TypeScript and styled with [Tailwind CSS](https://tailwindcss.com/).
-   **Communication**: The frontend and backend communicate exclusively through REST APIs.

### Developer Workflows

The easiest way to get started is to use the provided VS Code tasks.

-   **Start Everything**: Run the `Start All Servers` task in VS Code. This will launch both the backend and frontend development servers.
-   **Start Backend**: Run the `Start Backend (Django)` task. This script handles:
    1.  Initializing the database (`scripts/init_db.ps1`).
    2.  Creating a Python virtual environment (`venv`) if it doesn't exist.
    3.  Installing dependencies from `backend/requirements.txt`.
    4.  Running database migrations.
    5.  Starting the Django development server.
-   **Start Frontend**: Run the `Start Frontend (Next.js)` task. This runs `npm run dev` in the `frontend` directory.

For manual setup, refer to the root `README.md`.

### Backend Conventions

-   **Modularity**: The backend is organized into numerous small, single-purpose Django apps (e.g., `authentication`, `profiles`, `orders`, `chat`). When adding new features, consider if they belong in an existing app or a new one.
-   **Dependencies**: Backend Python packages are managed in `backend/requirements.txt`.
-   **ORM**: Use the Django ORM and migrations to interact with the database. Key models are spread across the different app directories. `authentication/models.py` and `profiles/models.py` are central to user data.
-   **API**: The API is built using Django REST Framework. Serializers, Views, and URLs are defined within each app. For example, see `authentication/serializers.py`, `authentication/views.py`, and `authentication/urls.py`.

### Frontend Conventions

-   **App Router**: The frontend uses the Next.js App Router. Pages and layouts are located in `frontend/app/`.
-   **Components**: Reusable UI components are in `frontend/components/`.
-   **Styling**: Use Tailwind CSS utility classes for styling. Global styles are in `frontend/styles/`.
-   **State Management**: The application uses React Context for state management, defined in `frontend/context/`.
-   **Data Fetching**: Services for interacting with the backend API are located in `frontend/services/`. These services should be used for all communication with the backend.
-   **Configuration**: Site-wide configuration, like feature flags or constants, can be found in `frontend/config/site.ts`.

### Key Files

-   `d:\\Web Server\\GitHub\\Starbound\\README.md`: High-level project overview.
-   `d:\\Web Server\\GitHub\\Starbound\\backend\\manage.py`: Django's command-line utility.
-   `d:\\Web Server\\GitHub\\Starbound\\backend\\requirements.txt`: Backend dependencies.
-   `d:\\Web Server\\GitHub\\Starbound\\frontend\\package.json`: Frontend dependencies and scripts.
-   `d:\\Web Server\\GitHub\\Starbound\\frontend\\next.config.ts`: Next.js configuration.
-   `d:\\Web Server\\GitHub\\Starbound\\frontend\\app\\`: Main directory for frontend pages and layouts.
