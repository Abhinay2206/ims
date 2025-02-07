# Real-Time Inventory Management System

## Introduction
This project is a **Real-Time Inventory Management System** designed to track and update inventory levels for businesses in real time. It includes role-based access for **Admins** and **Employees**, providing features like inventory tracking, stock movement analysis, low-stock alerts, AI-powered inventory recommendations, customer analytics, supplier management, and advanced reporting capabilities. The system is built using the **MERN stack** (MongoDB, Express.js, React.js, and Node.js) with Python-based machine learning models.

---

## Features

### Admin Features:
- Add, edit, and delete products
- View and manage inventory details
- Low-stock alerts for products
- Generate stock movement and sales reports
- Role management for users (add/edit/delete employees)
- AI-powered inventory recommendations and product bundling suggestions
- Customer analysis and segmentation
- Supplier performance analytics
- Advanced monthly and yearly reports
- Multiple bill generation capability
- Smart discount suggestions based on product expiry dates
- Fraud bill detection system

### Employee Features:
- View inventory list with stock levels
- Low-stock alerts
- Real-time stock updates
- Access to inventory recommendations
- Generate multiple bills
- View customer analytics
- Access expiry-based discount suggestions

---

## Project Structure

### Frontend:
- **React.js**: For building the user interface
- **Material-UI**: For UI components and styling

### Backend:
- **Node.js**: Server-side logic
- **Express.js**: REST API framework
- **Python**: Machine learning models for inventory recommendations, customer analysis, and fraud detection

### Database:
- **MongoDB**: For storing product details, user data, inventory records, customer analytics, and supplier information

---

## Installation and Setup

### Prerequisites:
1. **Node.js** installed on your system
2. **MongoDB** running locally or on a cloud service (e.g., MongoDB Atlas)
3. **Python 3.x** with required ML libraries (scikit-learn, pandas, numpy, tensorflow)
4. Basic knowledge of JavaScript, Python, and the MERN stack

## Getting Started

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Abhinay2206/ims.git
cd ims
```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
PYTHON_API_PORT=5001
```

3. Install dependencies:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd python-model
pip install -r requirements.txt
```

### Running the Application

1. Start the MongoDB service:
```bash
# If using local MongoDB
mongod
```

2. Start the backend server:
```bash
# From the root directory
npm run server
```

3. Start the Python ML service:
```bash
# From the ml-service directory
python app.py
```

4. Start the frontend development server:
```bash
# From the root directory
npm run client
```

5. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5017`
   - ML Service: `http://localhost:5001`

```

## Contributing

We welcome contributions to improve the Inventory Management System! Here's how you can contribute:

### Development Process

1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

3. Follow the coding standards:
   - Use ESLint for JavaScript code
   - Follow PEP 8 for Python code
   - Write meaningful commit messages
   - Add comments for complex logic
   - Include unit tests for new features

4. Testing requirements:
   - Write unit tests for new features
   - Ensure all existing tests pass
   - Test across different browsers
   - Verify mobile responsiveness

### Pull Request Process

1. Update documentation:
   - Add relevant comments to your code
   - Update README.md if needed
   - Document any new environment variables
   - Add API documentation for new endpoints

2. Submit your PR:
   - Provide a clear PR description
   - Link related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. Code Review:
   - Address reviewer comments
   - Maintain a professional discussion
   - Make requested changes promptly

### Reporting Issues

When reporting issues, include:
- Clear issue description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details
- Related logs or error messages

### Development Guidelines

#### Frontend
- Use functional components with hooks
- Follow Material-UI design patterns
- Implement responsive designs
- Use TypeScript for new components
- Follow the established state management pattern

#### Backend
- Follow RESTful API principles
- Implement proper error handling
- Add input validation
- Maintain API documentation
- Use async/await for asynchronous operations

#### Machine Learning Service
- Document model training procedures
- Include model performance metrics
- Save model artifacts properly
- Implement proper error handling
- Add logging for monitoring

### Security Guidelines

- Never commit sensitive data
- Implement proper input validation
- Use parameterized queries
- Follow security best practices
- Regular dependency updates
- Implement rate limiting
- Use proper authentication

### Release Process

1. Version Control:
   - Follow semantic versioning
   - Update CHANGELOG.md
   - Tag releases appropriately

2. Deployment:
   - Test in staging environment
   - Perform security checks
   - Update documentation
   - Create release notes

3. Post-Release:
   - Monitor for issues
   - Address critical bugs
   - Update status reports