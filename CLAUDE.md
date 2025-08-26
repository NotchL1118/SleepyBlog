# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev          # Start Next.js development server
npm run dev:turbo    # Start with Turbopack (faster development builds)

# Production builds
npm run build        # Build for production
npm run start        # Start production server

# Code quality
npm run lint         # Run ESLint
npm run check-db     # Check MongoDB connection and database status
```

## Database Setup

This project uses MongoDB with connection caching. Before development:

1. Set up `.env.local` with `MONGODB_URL`
2. Run `npm run check-db` to verify connection
3. Visit `/test-api` page to initialize seed data if needed

The database connection is cached globally to prevent reconnection issues in development.

## Project Architecture

### Next.js App Router Structure
- **`src/app/`** - App Router pages and API routes
  - `api/articles/` - Article CRUD API endpoints with slug-based routing
  - `article/[slug]/` - Dynamic article detail pages
  - Additional content sections: `blog/`, `camera/`, `life/`, `thoughts/`, `about/`

### Core Components
- **`src/components/`** - Reusable React components
  - `MDX/` - Custom MDX components for rich content (CodeBlock, Highlight, ImageCard)
  - `Header/` - Navigation with glow effects and theme switching
  - `ArticleList/` - Article display and card components
  - `ThemeSwitcher/` - Dark/light mode toggle using next-themes

### Data Layer
- **`src/models/Article.ts`** - Mongoose schema with validation, indexing, and auto-timestamps
- **`src/lib/mongodb.ts`** - Connection management with global caching
- **`src/services/api/`** - Client-side API service functions

### TypeScript Configuration
- Path aliases configured for `@/*`, `@/components/*`, `@/lib/*`, etc.
- Strict mode enabled with unused variable checks disabled
- ES2017 target with Next.js plugin integration

## MDX Integration

Uses `@next/mdx` with `remark-gfm` for GitHub Flavored Markdown support. Custom MDX components provide enhanced content rendering capabilities.

## Styling Architecture

- **Tailwind CSS** with custom font configuration (LXGW WenKai GB, Alibaba PuHuiTi)
- **SCSS Modules** for component-specific styling
- **Motion/Framer Motion** for animations
- Dark mode support via CSS custom properties and `next-themes`

## Environment Requirements

- **Node.js** with Next.js 15 and React 19
- **MongoDB** database connection
- **Environment variables**: `MONGODB_URL` in `.env.local`

## Code Style

- **Prettier** configuration with import organization and Tailwind class sorting
- **ESLint** extends Next.js recommendations with unused variable rules disabled
- 120 character line width, 2-space indentation