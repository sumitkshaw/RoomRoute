# HouseHunt

HouseHunt is a full-stack web application for property rentals and bookings, similar to Airbnb. Users can list their properties, browse available listings, and make bookings.

## Tech Stack

### Frontend

- React 18
- Material-UI (MUI) for styling
- Redux Toolkit for state management
- React Router for navigation
- SASS for custom styling
- React Beautiful DND for drag and drop features
- React Date Range for date picking

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- CORS for cross-origin requests

## Project Structure

```
project-root/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/              # Source files
│   ├── package.json      # Frontend dependencies
│   └── .env             # Frontend environment variables
│
└── server/                # Backend Node.js application
    ├── models/           # MongoDB models
    ├── routes/           # API routes
    ├── public/           # Uploaded files
    ├── index.js         # Server entry point
    ├── package.json     # Backend dependencies
    └── .env            # Backend environment variables
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd househunt
```

2. Set up the backend:

```bash
cd server
npm install
```

Create a `.env` file in the server directory with:

```
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/HouseHunt?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
```

3. Set up the frontend:

```bash
cd ../client
npm install
```

Create a `.env` file in the client directory with:

```
REACT_APP_API_BASE_URL=http://localhost:3001
```

## MongoDB Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<username>`, `<password>`, and cluster URL in the backend `.env` file

## Running the Application

1. Start the backend server:

```bash
cd server
npm start
```

The server will run on http://localhost:3001

2. In a new terminal, start the frontend application:

```bash
cd client
npm start
```

The application will open in your browser at http://localhost:3000

## Features

- User authentication (signup/login)
- Property listing creation and management
- Property search and filtering
- Booking system
- User profiles
- Image upload for properties
- Responsive design

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
