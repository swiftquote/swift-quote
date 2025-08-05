# Swift Quote - Professional Quoting SaaS

A complete SaaS application for service-based businesses to create, manage, and share professional quotes. Built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

### Core Features
- **User Authentication**: Secure signup/login with Google OAuth support
- **User Profiles**: Business information setup with logo, contact details
- **Quote Builder**: Intuitive interface to create professional quotes
- **Line Items**: Add multiple services/products with automatic calculations
- **Smart Calculations**: Auto-calculate subtotal, VAT, discounts, and totals
- **Quote Management**: Save, edit, and organize quotes in dashboard
- **PDF Export**: Generate professional PDF quotes
- **Shareable Links**: Create unique links to share quotes with clients
- **Free Tier**: 3 free quotes per user

### Monetization
- **Stripe Integration**: Secure payment processing
- **Subscription Plans**: Monthly (£9.99) and Yearly (£59.99) options
- **Upgrade Flow**: Seamless upgrade from free to pro
- **Customer Portal**: Manage subscriptions and billing

### Advanced Features
- **Admin Panel**: View users, quotes, and system analytics
- **Referral System**: Earn free months for referring friends
- **Analytics Dashboard**: Track business performance and metrics
- **Responsive Design**: Works perfectly on all devices

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Lucide React** icons
- **React Hook Form** with Zod validation
- **TanStack Query** for server state
- **Zustand** for client state

### Backend
- **Next.js API Routes** for serverless functions
- **NextAuth.js v4** for authentication
- **Prisma ORM** with SQLite
- **Stripe** for payment processing
- **jsPDF** for PDF generation

### Deployment
- **Vercel** for hosting (recommended)
- **SQLite** database (easy to deploy)
- **Serverless** architecture

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swift-quote
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
   
   # Stripe Price IDs
   STRIPE_MONTHLY_PRICE_ID="price_your-monthly-price-id"
   STRIPE_YEARLY_PRICE_ID="price_your-yearly-price-id"
   
   # Base URL
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on every push

### Environment Variables for Production

```env
# Required
DATABASE_URL="file:./prod.db"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"
STRIPE_SECRET_KEY="sk_live_your-production-stripe-key"
STRIPE_PUBLISHABLE_KEY="pk_live_your-production-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-production-webhook-secret"
STRIPE_MONTHLY_PRICE_ID="price_your-production-monthly-price"
STRIPE_YEARLY_PRICE_ID="price_your-production-yearly-price"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Optional
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
```

### Stripe Setup

1. **Create Stripe Account**
   - Sign up at [Stripe](https://stripe.com)
   - Get your API keys from the Dashboard

2. **Create Products and Prices**
   ```bash
   # Create monthly product
   stripe products create name="Swift Quote Pro Monthly" --description="Monthly subscription"
   
   # Create monthly price
   stripe prices create --product="prod_xxxxx" --currency=gbp --unit-amount=999 --recurring-interval=month
   
   # Create yearly product
   stripe products create name="Swift Quote Pro Yearly" --description="Yearly subscription"
   
   # Create yearly price
   stripe prices create --product="prod_xxxxx" --currency=gbp --unit-amount=5999 --recurring-interval=year
   ```

3. **Set Up Webhook**
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Listen for events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### Google OAuth Setup (Optional)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable OAuth 2.0**
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── billing/       # Subscription management
│   │   ├── quotes/        # Quote management
│   │   ├── referrals/     # Referral system
│   │   ├── stripe/        # Stripe webhooks
│   │   ├── analytics/     # Analytics data
│   │   └── admin/         # Admin panel
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── quote/             # Public quote viewing
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # Session provider
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database client
│   ├── stripe.ts        # Stripe configuration
│   └── utils.ts         # Helper functions
└── prisma/               # Database schema
```

## 🎯 Usage

### For Users

1. **Sign Up**: Create an account with email/password or Google
2. **Set Up Profile**: Add your business information
3. **Create Quotes**: Use the quote builder to create professional quotes
4. **Share with Clients**: Generate shareable links or PDF exports
5. **Track Performance**: View analytics and conversion rates
6. **Upgrade to Pro**: Unlock unlimited quotes and advanced features

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **View Users**: Monitor user registrations and subscriptions
3. **Track Quotes**: View all quotes created in the system
4. **Analyze Performance**: Check system-wide metrics

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Code formatting (configured in .prettierrc)
- **Prisma**: Type-safe database access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. For commercial support, contact us at support@swiftquote.com

## 🌟 Star History

If this project helped you, please consider giving it a star! It helps the project grow and shows your appreciation.

---

Built with ❤️ using Next.js and modern web technologies.