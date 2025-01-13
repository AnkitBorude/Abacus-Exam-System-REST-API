<div align="center">
  <h1>🚀 Abacus Exam REST API</h1>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  </p>
  <p>A secure, scalable REST API built with Node.js, Express, and MongoDB for managing and conducting online exams efficiently. This API provides robust features like authentication, question generation, analytics, and more.</p>
</div>
<hr>
<div align="center">
  <h2>✨ Features</h2>
</div>
<table align="center">
  <tr>
    <td align="center">🔒 <b>OAuth Security</b></td>
    <td align="center">⚙️ <b>RBAC</b></td>
    <td align="center">📊 <b>Analytics</b></td>
  </tr>
  <tr>
    <td align="center">📑 <b>Smart Question Generation</b></td>
    <td align="center">🔄 <b>Cookie-Free Architecture</b></td>
    <td align="center">🌐 <b>Cloud Optimized</b></td>
  </tr>
</table>
<div align="center">
  <h2>🛠️ Tech Stack</h2>
</div>
<table align="center">
  <tr>
    <th>Category</th>
    <th>Technologies</th>
  </tr>
  <tr>
    <td>Server</td>
    <td><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js"/></td>
  </tr>
  <tr>
    <td>Framework</td>
    <td><img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white" alt="Express.js"/></td>
  </tr>
  <tr>
    <td>Database</td>
    <td><img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB"/></td>
  </tr>
  <tr>
    <td>Packages</td>
    <td>
      randomjs, jsPDF, mongoose, winston, morgan, joi, helmet, dotenv, bcryptjs
    </td>
  </tr>
</table>
<div align="center">
  <h2>🔧 Installation</h2>
</div>
<p>For installation and setup instructions, please refer to the <a href="https://ankitborude.github.io/Abacusexam-documentation">API Documentation</a>.</p>
<div align="center">
  <h2>📜 API Documentation</h2>
</div>
<p>Find the comprehensive API documentation <a href="https://ankitborude.github.io/Abacusexam-documentation">here</a>.</p>
<div align="center">
  <h2>📊 Testing and Coverage</h2>
</div>
<p>The API is end-to-end tested on Postman with approximately 80% code coverage. Explore the Postman workspace <a href="https://www.postman.com/postman-api-fundamentals-student-expert-6316/abacus-exam-system-rest-api/overview">here</a>.</p>
<div align="center">
  <h2>📜 Scripts</h2>
</div>
<pre>
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "NODE_ENV=production node ./src/index.js",
    "dev": "nodemon ./src/index.js",
    "prof": "node --prof ./src/index.js",
    "lint": "npx eslint .",
    "lint:fix": "npx eslint . --fix",
    "format:check": "npx prettier . --check",
    "format:fix": "npx prettier . --write",
    "db:dump": "node ./scripts/mongo-dump.js dump",
    "db:restore": "node ./scripts/mongo-dump.js restore"
}
</pre>
<div align="center">
  <h2>🤝 Contributing</h2>
</div>
<p>Contributions are welcome! Feel free to fork the repository, make changes, and submit a pull request. Ensure your code follows the project style guidelines and includes tests.</p>
<div align="center">
  <h2>⚖️ License</h2>
</div>
<p>This project is licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache 2.0 License</a>.</p>
