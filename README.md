# NCA TECHNICAL Customer & Admin Portal

Full-stack starter application for NCA TECHNICAL Cyber Cafe & Digital Service Center.

## Technology
- Frontend: React 18 + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + bcrypt password hashing
- Payments: Optional Razorpay order creation and signature verification

## Included modules
- Public service directory and contact information
- Customer registration and login
- Customer dashboard
- Service request submission
- Customer request status tracking
- Admin dashboard with customer/request overview
- Admin request status management
- Optional Razorpay payment order and verification endpoints
- WhatsApp support links, email support and click-to-call

## Requirements
- Node.js 18+
- PostgreSQL 14+
- npm

## Setup
1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Create a PostgreSQL database named `nca_technical`.
4. Copy `.env.example` to `.env` and update database credentials and a long random `JWT_SECRET`.
5. Install dependencies:
   ```bash
   npm install
   ```
6. Initialize database:
   ```bash
   npm run db:init
   ```
7. Configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`. Use a strong password of at least 12 characters.
8. Create the admin account:
   ```bash
   npm run admin:create
   ```
9. Start frontend and backend:
   ```bash
   npm run dev
   ```
10. Open `http://localhost:5173`.

## Payment gateway setup
Payments are disabled until Razorpay credentials are configured. Add your Razorpay Key ID and Key Secret to `.env`. Never expose the Key Secret in frontend code or commit `.env` to source control. Configure and verify Razorpay webhooks before accepting live payments; the included flow verifies checkout signatures but does not yet implement webhook reconciliation/refund handling. Test in Razorpay test mode first.

## Deployment notes
- Deploy the API and PostgreSQL database using a trusted hosting provider.
- Deploy the Vite frontend as a static site.
- Set `VITE_API_URL` at frontend build time to the deployed API base URL (for example `https://api.example.com/api`).
- Set `CLIENT_ORIGIN` on the API to the exact deployed frontend origin.
- Set `NODE_ENV=production`, a strong unique `JWT_SECRET`, and production database/payment credentials.
- Serve everything over HTTPS.
- Add automated database backups, monitoring, privacy policy, terms, and operational support procedures before public launch.

## Important limitations and safety
- This is a functional starter portal, not a fully audited production system.
- Government services, Aadhaar updates, passport services, train/flight ticketing and certificate issuance are assisted through relevant official/authorized portals; this app does not directly submit those applications or issue tickets.
- No document upload module is enabled in this starter. Add encrypted, access-controlled storage and retention rules before collecting identity documents.
- Do not ask customers to share passwords, OTPs, Aadhaar OTPs, card PINs or banking credentials through this portal, WhatsApp or email.
- Payment collection requires a merchant account and correct tax/refund/terms configuration.
- Have the application security-reviewed before handling real customer data or payments.
