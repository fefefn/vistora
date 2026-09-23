
# 🛍️ Vistora — Modern E-Commerce Platform

Vistora is a modern, full-stack e-commerce platform built with React, TypeScript, Node.js, Express, MongoDB, and Razorpay.

The platform provides a complete shopping experience, including product discovery, category-based filtering, cart management, secure authentication, order processing, online payments, refunds, wishlist management, and an admin dashboard.

Vistora is designed with a scalable architecture, clean code organization, responsive UI, and production-oriented backend security practices.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | https://vistora-green.vercel.app |
| Backend API | https://vistora-2.onrender.com |
| Health Check | https://vistora-2.onrender.com/api/health |
| Products API | https://vistora-2.onrender.com/api/products |
| GitHub Repository | https://github.com/fefefn/vistora |

> **Note:** Razorpay is configured for Test Mode. The backend is deployed on Render's free tier, so the first request after inactivity may take some time because the service can spin down.

---

## ✨ Features

### 👤 Authentication and User Management

- User registration and login
- JWT-based authentication
- Protected routes
- Role-based access control
- Customer and admin roles
- Account status validation
- Secure password handling
- Authentication rate limiting

### 🛒 Shopping Experience

- Browse products
- Product details
- Product search
- Category filtering
- Gender-based filtering
- Brand filtering
- Color filtering
- Fabric filtering
- Size filtering
- Price range filtering
- Rating-based filtering
- Sorting by:
  - Newest
  - Popularity
  - Rating
  - Price: Low to High
  - Price: High to Low
- Deals section
- Discount percentage display
- Product stock status
- Low-stock indication
- Responsive product cards

### 🛍️ Cart Management

- Add products to cart
- Update product quantity
- Remove cart items
- Clear cart
- Automatic quantity handling
- Cart total calculation
- Stock validation

### ❤️ Wishlist

- Add products to wishlist
- Remove products from wishlist
- View wishlist items
- Authenticated wishlist management

### 📦 Order Management

- Cash on Delivery orders
- Razorpay online payments
- Shipping address validation
- Order creation
- Order history
- Order status tracking
- Order cancellation
- Stock restoration after cancellation
- Payment status management
- Order status transition validation

### 💳 Payment Integration

- Razorpay payment gateway
- Razorpay order creation
- Payment signature verification
- Payment ownership validation
- Payment amount validation
- Payment currency validation
- Captured payment verification
- Duplicate payment protection
- Payment failure handling
- Refund support
- Razorpay webhook integration
- Webhook signature verification

> Razorpay is currently configured for testing purposes.

### 🔄 Refund Management

- Create refund requests
- View personal refund requests
- Admin refund management
- Refund status tracking
- Razorpay refund integration
- Refund status transitions
- Refund processing support
- Refund webhook handling

### 👨‍💼 Admin Dashboard

- Admin authentication
- Product creation
- Product editing
- Product management
- Product stock management
- Order management
- Order status updates
- Refund management
- Role-based admin access

### 🎨 UI and User Experience

- Modern and responsive design
- Mobile-friendly layout
- Premium e-commerce interface
- Responsive navigation bar
- Product cards with discount badges
- Wishlist interaction
- Responsive filter sidebar
- Loading and error states
- Framer Motion animations
- Reusable UI components
- Global design system
- Accessible focus states

---

## 🧰 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- React Query
- Tailwind CSS
- Framer Motion
- Lucide React Icons

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Razorpay
- Express Rate Limit
- Morgan
- Helmet
- CORS

### Database

- MongoDB Atlas
- Mongoose ODM
- Indexed product fields
- User and role management
- Cart and order collections
- Refund and wishlist collections

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Payment Gateway: Razorpay
- Version Control: Git and GitHub

---

## 🏗️ Project Architecture

```text
Vistora
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── redux
│   │   ├── services
│   │   ├── types
│   │   ├── utils
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── scripts
│   │   ├── services
│   │   ├── types
│   │   ├── utils
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## 📋 Main Application Modules

```text
Authentication
    ├── Register
    ├── Login
    ├── JWT Authentication
    └── Role-Based Access

Products
    ├── Product Listing
    ├── Product Details
    ├── Search
    ├── Filtering
    ├── Sorting
    └── Deals

Shopping
    ├── Cart
    ├── Wishlist
    └── Checkout

Orders
    ├── Cash on Delivery
    ├── Razorpay Payment
    ├── Order History
    ├── Order Status
    └── Cancellation

Payments
    ├── Razorpay Orders
    ├── Payment Verification
    ├── Refunds
    └── Webhooks

Administration
    ├── Product Management
    ├── Order Management
    ├── Refund Management
    └── Role-Based Authorization
```

---

## 🚀 Getting Started

Follow the steps below to run Vistora locally.

### 1. Clone the Repository

```bash
git clone https://github.com/fefefn/vistora.git
```

Navigate into the project:

```bash
cd vistora
```

---

## 🎨 Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## ⚙️ Backend Setup

Open another terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Example environment configuration:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id

RAZORPAY_KEY_SECRET=your_razorpay_key_secret

RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

> Never commit your actual `.env` file, database credentials, JWT secrets, or Razorpay secret keys to GitHub.

Start the backend development server:

```bash
npm run dev
```

The backend API will be available at:

```text
http://localhost:5000
```

---

## 🛠️ Available Scripts

### Frontend Scripts

Run these commands from the `frontend` directory.

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build of the frontend.

```bash
npm run preview
```

Previews the production build locally.

---

### Backend Scripts

Run these commands from the `backend` directory.

```bash
npm run dev
```

Starts the backend development server.

```bash
npm run build
```

Compiles the TypeScript backend into JavaScript.

```bash
npm start
```

Starts the compiled production server.

---

## 🔐 Security Practices

Vistora implements several security and reliability practices:

- JWT-based authentication
- Password hashing using bcryptjs
- Protected API routes
- Role-based authorization
- Admin-only endpoints
- Request rate limiting
- CORS configuration
- HTTP security headers using Helmet
- Environment variable configuration
- Webhook signature verification
- Razorpay payment signature verification
- Payment ownership validation
- Duplicate payment protection
- Order status transition validation
- Atomic stock restoration during cancellation
- MongoDB indexes for important fields
- Request body size limits
- Production database readiness checks

---

## 💳 Razorpay Payment Flow

The Razorpay payment process follows these steps:

```text
1. User adds products to the cart
          |
          v
2. User enters shipping information
          |
          v
3. Backend creates a Razorpay order
          |
          v
4. Razorpay Checkout opens
          |
          v
5. User completes the payment
          |
          v
6. Frontend receives Razorpay payment details
          |
          v
7. Backend verifies the payment signature
          |
          v
8. Backend validates payment amount and ownership
          |
          v
9. Order is created
          |
          v
10. Cart is cleared
```

Razorpay is currently configured in Test Mode for development and demonstration.

---

## 📡 API Health Check

The backend provides a health check endpoint:

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Vistora API is running"
}
```

A readiness endpoint is also available:

```http
GET /api/health/ready
```

This endpoint checks whether the backend is ready to communicate with the database.

---

## 📦 Product Filtering

The product API supports multiple filtering and sorting options.

Example endpoint:

```http
GET /api/products
```

Example query parameters:

```text
/api/products?category=clothing
/api/products?gender=men
/api/products?minPrice=500&maxPrice=3000
/api/products?sort=price_asc
/api/products?minRating=4
/api/products?deals=true
```

Supported filters include:

- Search
- Gender
- Category
- Brand
- Color
- Fabric
- Size
- Minimum price
- Maximum price
- Minimum rating
- Deals
- Pagination
- Sorting

---

## ☁️ Deployment

### Frontend Deployment

The frontend is deployed using Vercel.

Production frontend:

```text
https://vistora-green.vercel.app
```

Frontend environment variable:

```env
VITE_API_URL=https://vistora-2.onrender.com/api
```

### Backend Deployment

The backend is deployed using Render.

Production backend:

```text
https://vistora-2.onrender.com
```

Backend environment variables must be configured in the Render dashboard.

### Database

MongoDB Atlas is used as the production database.

The production backend connects to MongoDB Atlas using the `MONGODB_URI` environment variable.

---

## 🧪 Testing Checklist

Before deploying changes, verify the following:

- [ ] User registration works
- [ ] User login works
- [ ] Invalid login credentials are rejected
- [ ] Product listing loads correctly
- [ ] Product filters work correctly
- [ ] Product search works
- [ ] Cart item can be added
- [ ] Cart quantity can be updated
- [ ] Cart item can be removed
- [ ] Wishlist functionality works
- [ ] COD order can be created
- [ ] Razorpay Test Mode payment works
- [ ] Payment signature is verified
- [ ] Order history loads
- [ ] Order cancellation works
- [ ] Stock is restored after cancellation
- [ ] Admin routes are protected
- [ ] Customer cannot access admin routes
- [ ] Refund request flow works
- [ ] Backend health check works
- [ ] Frontend connects to the production API
- [ ] Environment secrets are not committed

---

## 🔮 Future Improvements

The following features can be added in future versions:

- Product image upload using Cloudinary or AWS S3
- Advanced product management
- Product reviews and ratings
- Coupon and discount management
- Advanced analytics dashboard
- Email notifications
- SMS notifications
- Order invoice generation
- Multiple payment methods
- Improved product recommendation system
- Automated testing with Jest and Supertest
- CI/CD pipeline
- Docker containerization
- Advanced logging and monitoring
- Pagination improvements
- Product variant management
- Inventory management enhancements

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

5. Push your branch.

```bash
git push origin feature/your-feature-name
```

6. Open a Pull Request.

---

## 📄 License

This project is currently intended for portfolio, learning, and demonstration purposes.

A formal open-source license can be added in the future if required.

---

## 👨‍💻 Author

**Manish**

Full-Stack Software Engineer

GitHub: https://github.com/fefefn

---

## ⭐ Support

If you find this project useful, consider giving the repository a star on GitHub.

Thank you for checking out **Vistora**! 🛍️
