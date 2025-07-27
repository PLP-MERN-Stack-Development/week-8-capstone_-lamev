# StockMaster Pro - Inventory Management System

A comprehensive MERN stack application designed to help small businesses and hawkers manage their inventory efficiently. StockMaster Pro provides real-time stock tracking, low stock alerts, and professional inventory management features.

## 🌟 Features

### Core Features
- **Product Management**: Add, edit, delete, and track products
- **Stock Monitoring**: Real-time quantity tracking with low stock alerts
- **Category Management**: Organize products by categories
- **Search & Filter**: Find products quickly with advanced filtering
- **Data Export**: Export inventory data to CSV format

### User Authentication
- **Secure Registration & Login**: JWT-based authentication
- **User Profiles**: Personalized dashboard experience
- **Session Management**: Persistent login sessions

### Dashboard Features
- **Real-time Statistics**: Total products, low stock items, categories, inventory value
- **Recent Activity Tracking**: Monitor all inventory changes
- **Quick Actions**: Sample product addition, data export, refresh
- **Professional UI**: Modern, responsive design with professional branding

### Advanced Features
- **Low Stock Alerts**: Automatic notifications for items below threshold
- **Activity Logging**: Track all add, edit, and delete operations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Clock**: Current date and time display

## 🚀 Live Demo

- **Frontend**: [StockMaster Pro Dashboard](https://stockmaster-frontend.onrender.com)
- **Backend API**: [StockMaster API](https://stockmaster-backend.onrender.com)

## 🛠️ Technology Stack

### Frontend
- **React.js**: Modern UI library
- **CSS3**: Custom styling with modern design
- **JavaScript ES6+**: Modern JavaScript features

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

### Development Tools
- **Git**: Version control
- **Render**: Cloud deployment platform

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PLP-MERN-Stack-Development/week-8-capstone_-lamev.git
   cd week-8-capstone_-lamev
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in backend directory
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stockdb
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Start backend
   cd backend
   npm start

   # Terminal 2 - Start frontend
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌐 Deployment

### Render Deployment

This project is configured for easy deployment on Render using the `render.yaml` file.

#### Automatic Deployment
1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` configuration
3. Set up environment variables in Render dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key

#### Manual Deployment Steps

1. **Backend Service**
   - Create a new Web Service on Render
   - Connect to your GitHub repository
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Environment Variables:
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `MONGO_URI`: Your MongoDB URI
     - `JWT_SECRET`: Your secret key

2. **Frontend Service**
   - Create a new Static Site on Render
   - Connect to your GitHub repository
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Environment Variables:
     - `REACT_APP_API_URL`: Your backend service URL

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)
- `GET /api/products/low-stock` - Get low stock products

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stockdb
JWT_SECRET=your_secret_key
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📱 Usage

1. **Registration**: Create a new account with username, email, and password
2. **Login**: Access your personalized dashboard
3. **Add Products**: Use the form to add new inventory items
4. **Monitor Stock**: View real-time statistics and low stock alerts
5. **Manage Inventory**: Edit quantities, thresholds, and categories
6. **Export Data**: Download inventory reports in CSV format

## 🎨 UI Features

- **Professional Branding**: StockMaster Pro with modern logo
- **Real-time Dashboard**: Live statistics and activity feed
- **Responsive Design**: Optimized for all device sizes
- **Intuitive Navigation**: Breadcrumbs and clear navigation
- **Visual Feedback**: Hover effects and smooth animations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: API endpoints require authentication
- **Input Validation**: Server-side validation for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

**StockMaster Pro Team**
- Full-stack MERN development
- Professional UI/UX design
- Cloud deployment expertise

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation
- Review the deployment guide

## 🔄 Version History

- **v1.0.0**: Initial release with core inventory management features
- Enhanced dashboard with professional branding
- Real-time statistics and activity tracking
- Responsive design and modern UI

---

**StockMaster Pro** - Making inventory management simple and efficient for small businesses worldwide! 📦✨ 