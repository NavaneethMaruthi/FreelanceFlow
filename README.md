# FreelanceFlow

## Authors

Navaneenth Maruthi & Rowan Lowden

## Relevant Links

[Web Link](https://rlowden22.github.io/index.html)

[Class Link](https://johnguerra.co/classes/webDevelopment_online_fall_2025/)

[Design Document](/designdocument.pdf)

[Google Slides](https://docs.google.com/presentation/d/1rYleCg4gGYmvLsm5UJN2bc4ibod5qCe9eh7do8R7aoU/edit?usp=sharing)

[Video Demo](https://youtu.be/ncYZG-jKV7I)

## Project Objective

The freelancer will be able to track clients, organize projects, log billable hours, and monitor their income without juggling multiple spreadsheets or tools. We use HTML5, CSS3, and vanilla JavaScript (ES6 modules) for the frontend, Node.js + Express for the backend, MongoDB for data storage

## Features

### User Management

- 🔐 Secure authentication with bcrypt password hashing
- 🔑 Persistent login sessions stored in MongoDB
- 👤 Protected routes and user-specific data

### Project Tracking

- ✏️ Create, read, update, and delete projects
- 📅 Set project deadlines and track status
- 🏷️ Categorize by status (To-Do, Active, Paused, Completed)

### Time Tracking

- ⏱️ Log billable hours with detailed descriptions
- 🔗 Link time entries to specific projects
- 💰 Track billing status (Unpaid, Invoiced, Paid)
- ✏️ Edit and delete time entries as needed

### Dashboard

- 📊 View total hours worked at a glance
- 📈 See project count and active projects
- 🎯 Monitor top 3 active projects with deadlines
- 💼 Centralized overview of freelance work

## Tech Stack

**Frontend:**

- HTML5, CSS3, Bootstrap 5
- Vanilla JavaScript (ES6 Modules)

**Backend:**

- Node.js + Express.js
- RESTful API architecture
- Native MongoDB driver (no Mongoose)

**Database:**

- MongoDB
- Session storage in MongoDB

**DevOps & Infrastructure**

- Docker - Container platform for MongoDB

**Development Tools**

- Nodemon - Auto-restart development server
- ESLint - Code linting and quality checks
- Prettier - Code formatting
- dotenv - Environment variable management
- Git - Version control

## Screenshots

![signup](screenshot/Signup.png)
![login](screenshot/Login.png)
![dashboard](screenshot/Dashboard.png)
![projects](screenshot/Projects.png)
![time](screenshot/Timesheets.png)

## Instructions

Step 1: Clone the Repository

```bash
git clone https://github.com/NavaneethMaruthi/FreelanceFlow.git
cd FreelanceFlow
```

Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including Express, MongoDB driver, bcryptjs, express-session, and more

Step 3: Configure Environment Variables
Create a .env file in the root directory:

```bash
touch .env
```

Add the following configuration to your .env file:

```
# MongoDB Connection
MONGO_URL=mongodb+srv://navaneethchintu789_db_user:Navaneeth@freelanceflow.6jzatqf.mongodb.net/?retryWrites=true&w=majority&appName=FreelanceFlow


# Session Configuration
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Cookie Settings
COOKIE_MAX_AGE=86400000

# Server Configuration
PORT=3000
NODE_ENV=development
```

Step 4: Set Up MongoDB
Using Local MongoDB

macOS: brew install mongodb-community
Ubuntu/Debian: sudo apt-get install mongodb
Windows: Download installer from mongodb.com

Step 5: Start Docker

Step 6: MongoDB
Create New MongoDB connection and connect it
(Make sure you make the changes in the code if you are using different names)

Step 5: Start the Application
Run the development server:

```bash
npm start
```

You should see output similar to:

```
Starting FreelanceFlow backend...
✅ Connected to MongoDB
✅ Server running on http://localhost:3000
📝 Environment: development
📁 Serving frontend from /frontend
📂 Auth routes available at /api/auth
📂 Projects routes available at /api/projects
The application is now running at: http://localhost:3000
```

## Use of AI

Rowan-- I used ChatGPT to help to explain some processes and break down topics I didn't understand like MongoDB and Docker and their role together, debugging the projects drop down on the time page, clarify express routes, help with mock data, and some other questions about the different tech stacks and how they worked together.

## License

MIT License
