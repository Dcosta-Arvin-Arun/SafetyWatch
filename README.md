# SafetyWatch

SafetyWatch is a modern, full-stack web application for reporting, tracking, and analyzing crime incidents in your community. It features real-time reporting, admin and user dashboards, interactive crime maps, and robust statistics, all with a focus on speed, security, and usability.

## Features

- Submit crime reports (anonymous or authenticated)
- Admin dashboard for managing and verifying reports
- User dashboard for tracking submitted reports
- Interactive map with clustering and heatmap
- Advanced search and filtering
- Real-time statistics and trends
- Email notifications (if configured)
- Secure authentication (Google OAuth)
- Responsive, mobile-friendly UI

## Tech Stack

- Next.js (App Router, SSR/SSG)
- React, TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL (Azure or local)
- SWR for client-side caching
- Framer Motion for animations
- Lucide Icons

## Getting Started

### 1. Clone the repository
```
git clone <your-repo-url>
cd SafetyWatch
```

### 2. Install dependencies
```
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_OCR_SPACE_API_KEY=your_ocr_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
DATABASE_URL="mysql://user:password@host:port/dbname?sslaccept=strict"
```

### 4. Set up the database
If using Prisma:
```
npx prisma migrate deploy
# or for development
npx prisma db push
```

### 5. Run the development server
```
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
- Configure your production `.env` variables.
- Deploy to Vercel, Azure, or your preferred platform.
- Ensure your database is accessible from your deployment environment.

## Notes
- For best performance, use a production-grade MySQL tier and enable pagination for large datasets.
- All sensitive operations are protected by authentication and role checks.
- For OCR features, sign up for a free API key at [ocr.space](https://ocr.space/).

## License
MIT
