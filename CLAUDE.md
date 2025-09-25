# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint with TypeScript and React rules
- `npm run preview` - Preview the production build locally

## Architecture Overview

This is an AWS Amplify Gen2 application using the modern `defineBackend` pattern with React + Vite frontend.

### Backend Architecture (`amplify/` directory)
- **`amplify/backend.ts`** - Main backend definition that imports and configures all resources
- **`amplify/data/resource.ts`** - GraphQL schema definition using Amplify's type-safe schema builder
- **`amplify/auth/resource.ts`** - Cognito authentication configuration (email-based login)
- **`amplify_outputs.json`** - Auto-generated AWS resource configuration (do not edit manually)

### Frontend Architecture (`src/` directory)
- **`src/main.tsx`** - Application entry point that configures Amplify and wraps app in Authenticator
- **`src/App.tsx`** - Main component demonstrating GraphQL client usage with real-time subscriptions
- Uses `generateClient<Schema>()` pattern for type-safe GraphQL operations
- Authentication state managed by `useAuthenticator` hook

### Data Pattern
- GraphQL schema defined using `a.schema()` builder in `amplify/data/resource.ts`
- Real-time updates via `client.models.Todo.observeQuery().subscribe()`
- Type safety ensured through generated `Schema` type from backend definition
- Current model: `Todo` with `content` field and public API key authorization

### Key Development Notes
- Backend resources are defined in TypeScript using Amplify Gen2 syntax
- The frontend uses React 19 with strict TypeScript configuration
- Authentication wraps the entire application - users must sign in to access any features
- All data operations are performed through the type-safe GraphQL client
- Real-time subscriptions automatically update the UI when data changes in DynamoDB