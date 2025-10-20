# 🛒 BrightBuy E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, and MySQL, featuring role-based access control, product variants, shopping cart, and order management.

## 🚀 Features

### 🛍️ Customer Features
- **Product Browsing**: Browse products with category filtering and search
- **Product Variants**: Select color, size, and model options with dynamic pricing
- **Shopping Cart**: Add, update, and remove items with real-time stock validation
- **Order Management**: Place orders with delivery and payment options
- **Order History**: Track order status and view past purchases
- **Price Sorting**: Sort products by price (low to high, high to low)

### 👨‍💼 Staff Features
- **Order Processing**: Manage and update order statuses
- **Inventory Management**: Monitor stock levels and product availability
- **Order Fulfillment**: Handle order processing and delivery

### 👑 Admin Features
- **User Management**: Create and manage user accounts
- **Product Management**: Add, edit, and delete products with variants
- **Order Management**: View all orders and system reports
- **Category Management**: Organize products into categories
- **System Reports**: Comprehensive analytics and reporting

## 🏗️ Architecture

### Frontend
- **React 19** with Vite for fast development
- **Tailwind CSS** for responsive design
- **Lucide React** for modern icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MySQL** database with connection pooling
- **JWT** authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### Database Schema
- **Users**: Customer, staff, and admin accounts
- **Products**: Product catalog with variants
- **Categories**: Hierarchical product organization
- **Cart**: Shopping cart management
- **Orders**: Order processing and tracking
- **Variants**: Product variations (color, size, model)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Imindu-J/BrightBuy.git
   cd BrightBuy
   ```

2. **Install backend dependencies**
   ```bash
   cd BrightBuy_backend/backend
   npm install
   ```

3. **Database setup**
   ```bash
   # Create database and run schema
   mysql -u root -p < Database/brightbuyDDL.txt
   mysql -u root -p < Database/brightbuyDML.txt
   ```

4. **Environment configuration**
   ```bash
   # Create .env file in backend directory
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=BrightBuy
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. **Start backend server**
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd BrightBuy_frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=BrightBuy
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Database Configuration
- Ensure MySQL is running
- Create database user with appropriate permissions
- Run the provided SQL scripts for schema and sample data

## 🎯 Usage

### Customer Workflow
1. **Browse Products**: Use category filters and search
2. **Select Variants**: Choose color, size, and model options
3. **Add to Cart**: Items are added with stock validation
4. **Manage Cart**: Update quantities or remove items
5. **Checkout**: Select delivery method and payment option
6. **Track Orders**: View order status in profile

### Staff Workflow
1. **Access Dashboard**: Login with staff credentials
2. **Process Orders**: Update order statuses
3. **Manage Inventory**: Monitor stock levels
4. **Handle Fulfillment**: Process and ship orders

### Admin Workflow
1. **System Management**: Full access to all features
2. **User Management**: Create staff and admin accounts
3. **Product Management**: Add/edit products and variants
4. **Reports**: View system analytics and reports

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for customer/staff/admin
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: SQL injection prevention
- **CORS Protection**: Cross-origin request security
- **Transaction Safety**: Database transactions for order operations

## 🛒 Key Features

### Product Management
- **Dynamic Variants**: Color, size, and model selection
- **Price Sorting**: Sort products by price (ascending/descending)
- **Category Filtering**: Browse by product categories
- **Search Functionality**: Fuzzy search across products
- **Stock Management**: Real-time stock validation

### Shopping Cart
- **Persistent Cart**: Cart persists across sessions
- **Stock Validation**: Prevents overselling
- **Quantity Management**: Update item quantities
- **Price Calculation**: Dynamic pricing based on variants

### Order Processing
- **Transaction Safety**: Atomic order operations
- **Stock Updates**: Automatic stock reduction
- **Order Tracking**: Status updates and history
- **Delivery Options**: Standard delivery and store pickup
- **Payment Methods**: Card payment and cash on delivery

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/verify` - Token verification

### Products
- `GET /products` - Get all products
- `GET /products/search` - Search products
- `GET /products/variants` - Get product variants
- `POST /products` - Add product (admin)

### Cart
- `GET /cart` - Get user cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove/:variantId` - Remove item

### Orders
- `POST /order` - Place order
- `GET /order/my-orders` - Get user orders
- `GET /order/:orderId` - Get order details
- `PUT /order/:orderId/status` - Update order status

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start server: `npm start`

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy build files to web server
3. Configure API endpoints for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

## 🎯 Future Enhancements

- Real-time notifications
- Advanced payment processing
- Mobile app development
- Advanced analytics
- Microservices architecture
- Redis caching
- Message queues
