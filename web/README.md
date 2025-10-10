# NEXPAY Admin Portal

A modern, fluid admin portal for managing NEXPAY payment gateway projects, providers, transactions, and settings.

## Features

- **Projects Management**: Create, edit, and manage payment projects
- **Payment Providers**: Configure and toggle payment provider integrations
- **Transactions**: View and filter payment transactions with detailed information
- **Settings**: 
  - Configure redirect URLs for payment flows
  - Manage webhook endpoints for payment events
- **Modern UI**: Dark theme with purple/blue accents, smooth animations
- **State Management**: Zustand for global state, React Query for server state
- **Form Validation**: React Hook Form with Zod schemas
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS v4, shadcn/ui components
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and set your API URL:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── (dashboard)/          # Dashboard layout group
│   │   ├── projects/         # Projects management
│   │   ├── providers/        # Payment providers
│   │   └── [projectId]/      # Project-specific routes
│   │       ├── transactions/ # Transaction list
│   │       └── settings/     # Project settings
│   │           ├── redirects/
│   │           └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── app-sidebar.tsx       # Main navigation sidebar
│   ├── page-header.tsx       # Page header component
│   ├── projects/             # Project-related components
│   ├── providers/            # Provider-related components
│   ├── transactions/         # Transaction-related components
│   └── webhooks/             # Webhook-related components
├── lib/
│   ├── api/                  # API client functions
│   │   ├── projects.ts
│   │   ├── providers.ts
│   │   ├── transactions.ts
│   │   └── settings.ts
│   ├── api-client.ts         # Axios instance
│   ├── types.ts              # TypeScript types
│   ├── store.ts              # Zustand store
│   ├── query-client.ts       # React Query client
│   └── utils.ts              # Utility functions
└── providers/
    └── query-provider.tsx    # React Query provider
\`\`\`

## API Routes

The admin portal connects to the NEXPAY API with the following structure:

- `GET /projects` - List all projects
- `POST /projects` - Create a project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update a project
- `DELETE /projects/{id}` - Delete a project

- `GET /settings/providers` - List payment providers
- `PUT /settings/providers` - Update provider configuration
- `DELETE /settings/providers/{id}` - Toggle provider status

- `GET /{projectId}/transactions` - List transactions
- `GET /{projectId}/transactions/{id}` - Get transaction details

- `GET /{projectId}/settings/redirects` - Get redirect URLs
- `POST /{projectId}/settings/redirects` - Create redirect URLs
- `PUT /{projectId}/settings/redirects` - Update redirect URLs

- `GET /{projectId}/settings/webhooks` - List webhooks
- `POST /{projectId}/settings/webhooks` - Create webhook
- `GET /{projectId}/settings/webhooks/{id}` - Get webhook details
- `PUT /{projectId}/settings/webhooks/{id}` - Update webhook

## Features in Detail

### Projects
- Paginated list with search
- Create projects with callback URLs
- Edit project details
- Delete projects
- View project transactions

### Payment Providers
- List all available providers
- Configure API credentials (key-value pairs)
- Toggle provider activation status
- Filter by active/inactive status

### Transactions
- Paginated transaction list
- Filter by status (Pending, Succeeded, Failed, etc.)
- Search by reference or customer info
- View detailed transaction information
- Status badges with color coding

### Settings
- **Redirects**: Configure success, failure, and cancel URLs
- **Webhooks**: Manage webhook endpoints with custom headers and secrets

## Development

\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
\`\`\`

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL for the NEXPAY API (required)

## License

Proprietary - NEXPAY
