Frontend Configuration (app.config.js) The app.config.js file in the frontend directory is responsible for loading environment variables and configuring the frontend application. It uses the dotenv package to load environment variables and exports a configuration object with these variables: • apiUrl: The base URL for API requests. • apiPort: The port for the API. • enableDebugMode: A flag to enable debug mode. • eas.projectId: A project ID for some external service.
Backend (app.ts) The backend/src/app.ts file sets up the backend server using Express. Here are the key components: • Middleware: o cors: Configures CORS with the frontend URL. o express.json(): Parses incoming JSON requests. o cookieParser(): Parses cookies. • Routes: o /api/auth: Handles authentication routes. o /api/timesheets: Handles timesheet-related routes. o /api/admin: Handles admin routes with authentication and admin checks. o /api/client: Handles client routes with API key validation. • Error Handling: o Uses a custom errorHandler middleware for handling errors. Interaction Summary
1.	Frontend: o Loads environment variables and configures API URL and port. o Sends HTTP requests to the backend for various operations (auth, timesheets, admin, client).
2.	Backend: o Sets up API routes for authentication, timesheets, admin, and client operations. o Uses middleware for CORS, JSON parsing, cookie parsing, authentication, API key validation, and error handling. This setup allows the frontend to interact with the backend via defined API endpoints, facilitating data exchange and application functionality.
API Flow Sequence of Files and Functions for API Call and Data Retrieval Frontend
1.	Configuration: o frontend/constants/Config.ts: Defines API endpoints and base URL. o frontend/utils/api.ts: Sets up Axios instance for API calls. o frontend/app.config.js: Loads environment variables for API configuration.
2.	API Call: o Example: frontend/app/(app)/timesheet.tsx  Uses fetch to make a POST request to the backend.  Builds the API URL using buildApiUrl from Config.ts. Backend
3.	Server Setup: o backend/src/server.ts: Initializes the Express server, sets up middleware, and defines routes. o backend/src/app.ts: Configures middleware and routes for the backend.
4.	API Endpoint: o Example: backend/src/routes/timesheet.ts  Handles API requests for timesheets.  Calls controller functions to process requests.
5.	Controller: o Example: backend/src/controllers/timesheet.ts  Processes the request, interacts with the database using Prisma, and returns the response.
6.	Middleware: o backend/src/middleware/auth.ts: Authenticates requests. o backend/src/middleware/apiKey.ts: Validates API keys. Flow Summary
7.	Frontend: o User action triggers an API call in a component (e.g., timesheet.tsx). o API call is made using fetch or Axios, with URLs constructed using Config.ts.
8.	Backend: o The server receives the request (server.ts and app.ts). o The request passes through middleware (e.g., auth.ts, apiKey.ts). o The appropriate route handler processes the request (routes/timesheet.ts). o Controller functions interact with the database and return data (controllers/timesheet.ts). This sequence outlines the interaction between the frontend and backend components for executing an API call and retrieving data from the database.
Axios is used in this project to create an instance for making HTTP requests. The Axios instance is configured with a base URL and headers, including an API key. You can see the implementation in frontend/utils/api.ts.
Babel is used in this project for transforming and compiling JavaScript and TypeScript code, particularly with the babel-preset-expo preset and plugins like module-resolver. This configuration is specified in frontend/babel.config.js. For more details, you can view the frontend/package.json file.



# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
