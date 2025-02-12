<div align="center">
  <h1>🚀 Abacus Exam REST API</h1>
  
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
  
  A secure, scalable REST API built with Node.js, Express, and MongoDB for managing and conducting online exams efficiently. This API provides robust features like authentication, question generation, analytics, and more.
</div>

## 📑 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔧 Installation](#-installation)
- [📜 API Documentation](#-api-documentation)
- [📊 Testing](#-testing)
- [📝 Scripts](#-scripts)
- [🤝 Contributing](#-contributing)
- [⚖️ License](#️-license)

## ✨ Features

<table align="center">
  <tr>
    <td align="center">Core Features</td>
    <td align="center">Security Features</td>
    <td align="center">Infrastructure Features</td>
  </tr>
  <tr>
    <td align="center">📑 Smart Question Generation</td>
    <td align="center">🔒 OAuth Security</td>
    <td align="center">🐳 Docker Support</td>
  </tr>
  <tr>
    <td align="center">📊 Advanced Analytics</td>
    <td align="center">⚙️ Role-Based Access Control</td>
    <td align="center">🌐 Cloud Optimized</td>
  </tr>
  <tr>
    <td align="center">🔄 Cookie-Free Architecture</td>
    <td align="center">🔐 Secure Authentication</td>
    <td align="center">📦 Containerization</td>
  </tr>
</table>
<h2>🗎 Read full Project Documentation on following Link</h2><br>
<h3>👉 <a href="https://ankitborude.github.io/Abacusexam-documentation">https://ankitborude.github.io/Abacusexam-documentation</a></h3><br>

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Container**: Docker & Docker Compose

### Key Dependencies
```json
{
  "dependencies": {
    "randomjs": "*",
    "jsPDF": "*",
    "mongoose": "*",
    "winston": "*",
    "morgan": "*",
    "joi": "*",
    "helmet": "*",
    "dotenv": "*",
    "bcryptjs": "*"
  }
}
```

## 🔧 Installation

### Bare Metal Installation
For Bare Metal installation and setup instructions, please refer to the [Bare-Metal Installation Guide](https://ankitborude.github.io/Abacusexam-documentation/#/installation).

### Docker Compose Installation
For Production and Local development deployment using docker compose, refer to [Docker Compose Installation Guide](https://ankitborude.github.io/Abacusexam-documentation/#/installation-with-docker).

## 📜 API Documentation
Find the comprehensive API documentation [here](https://ankitborude.github.io/Abacusexam-documentation/#/welcome).

## 📊 Testing and Coverage
The API is end-to-end tested on Postman with approximately 80% code coverage. Explore the Postman workspace [here](https://www.postman.com/postman-api-fundamentals-student-expert-6316/abacus-exam-system-rest-api/overview).

## 📝 Scripts
```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "NODE_ENV=production node ./src/index.js",
    "dev": "nodemon ./src/index.js",
    "prof": "node --prof ./src/index.js",
    "lint": "npx eslint .",
    "lint:fix": "npx eslint . --fix",
    "format:check": "npx prettier . --check",
    "format:fix": "npx prettier . --write"
  }
}
```

## Docker Compose Features

<section>
  <h3>Development/Local Features</h3>
  <ul>
    <li>Docker-based development environment with hot-reload capabilities</li>
    <li>Node.js application with automatic code synchronization through volume mounting</li>
    <li>MongoDB database with persistent storage</li>
    <li>Environment variable configuration support</li>
    <li>Automatic container restart functionality</li>
    <li>Port mapping for both application and database services</li>
  </ul>
</section>

<section>
  <h3>Production Features</h3>
  <ul>
    <li>Secure MongoDB authentication with root user credentials</li>
    <li>Health monitoring system for both application and database services</li>
    <li>Log rotation management to prevent disk space issues</li>
    <li>Multiple environment file support (.env and .prod.env)</li>
    <li>Automated container health checks with retry mechanisms</li>
    <li>Production-grade restart policies</li>
  </ul>
</section>

## 🤝 Contributing
Contributions are welcome! Feel free to fork the repository, make changes, and submit a pull request. Ensure your code follows the project style guidelines and includes tests.

## ⚖️ License
This project is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).