<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

<img src="https://raw.githubusercontent.com/tarekhatib/mindhive/master/public/assets/logos/MindHiveLight.svg">

<em>\* This report doesn't contain the full documentation of the project. Only the parts we have done so far.</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/tarekhatib/mindhive?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/tarekhatib/mindhive?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/tarekhatib/mindhive?style=flat&color=0080ff" alt="repo-language-count">

<em>Built with:</em>

<img src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" alt="Express">
<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black" alt=".ENV">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/EJS-B4CA65.svg?style=flat&logo=EJS&logoColor=black" alt="EJS">
<img src="https://img.shields.io/badge/Nodemon-76D04B.svg?style=flat&logo=Nodemon&logoColor=white" alt="Nodemon">

</div>
<br>

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
- [Features](#features)
- [Project Structure](#project-structure)
  - [Project Index](#project-index)
- [Roadmap](#roadmap)

---

## Overview

MindHive is an all-in-one productivity platform built for students. It combines note-taking, task management, calendar planning, and a built-in Pomodoro timer into one organized workspace. MindHive also introduces a friend system and leaderboard, motivating users by highlighting those who spend the most time studying. It helps students stay focused, manage their workload, and build consistent study habits — together.

This project streamlines backend development with a focus on security, modularity, and extensibility. The core features include:

- 🛡️ **JWT Authentication:** Secure user sessions with token generation, verification, and refresh mechanisms.
- ⚙️ **Modular Architecture:** Clear separation of concerns with controllers, middleware, and routes for easy customization.
- 🌐 **Database Schema:** Well-structured data models supporting users, tasks, social interactions, and productivity metrics.
- 🚀 **API-Driven:** RESTful endpoints for user management, task handling, and activity tracking.
- 🎯 **Scalable & Secure:** Designed for responsive, scalable applications with built-in security best practices.

---

## Features

|     | Component         | Details                                                                                                                                                                                            |
| :-- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚙️  | **Architecture**  | <ul><li>RESTful API built with **Express.js**</li><li>Server-side rendered views with **EJS**</li><li>Layered structure separating routes, controllers, and models</li></ul>                       |
| 🔩  | **Code Quality**  | <ul><li>Consistent code style with ESLint</li><li>Modular JavaScript files</li><li>Use of environment variables via **dotenv**</li></ul>                                                           |
| 📄  | **Documentation** | <ul><li>Basic README with setup instructions</li><li>Inline comments in source code</li><li>Minimal API documentation</li></ul>                                                                    |
| 🔌  | **Integrations**  | <ul><li>Database: **MySQL** via **mysql2**</li><li>Authentication: **jsonwebtoken**</li><li>Security: **helmet**, **express-rate-limit**</li><li>Session handling with **cookie-parser**</li></ul> |
| 🧩  | **Modularity**    | <ul><li>Separate modules for routes, controllers, models</li><li>Reusable middleware functions</li></ul>                                                                                           |
| 🛡️  | **Security**      | <ul><li>Password hashing with **bcrypt**</li></ul>                                                                                                                                                 |
| 📦  | **Dependencies**  | <ul><li>Core: **express**, **mysql2**, **jsonwebtoken**, **bcrypt**</li><li>Utilities: **dotenv**, **cors**, **cookie-parser**, **helmet**, **nodemon**</li></ul>                                  |

---

## Project Structure

```sh
└── mindhive/
    ├── app.js
    ├── package-lock.json
    ├── package.json
    ├── server.js
    ├── sql
    │   └── schema.sql
    └── src
        ├── .DS_Store
        ├── config
        ├── controllers
        ├── middleware
        ├── routes
        ├── services
        └── utils
```

---

## Database Schema

```sql
-- MySQL dump for MindHive core schema
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  total_points INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### Project Index

<details open>
	<summary><b><code>MINDHIVE/</code></b></summary>
	<!-- __root__ Submodule -->
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/server.js'>server.js</a></b></td>
					<td style='padding: 8px;'>- Initialize and start the server, establishing the entry point for the applications backend<br>- It configures environment variables, sets the listening port, and activates the server to handle incoming requests, thereby enabling the entire web service to operate and be accessible for client interactions within the overall architecture.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/app.js'>app.js</a></b></td>
					<td style='padding: 8px;'>- Defines the core Express application setup, orchestrating middleware, static assets, view rendering, and route integration for authentication, dashboard, Pomodoro timer, tasks, and settings features<br>- Serves as the central entry point that connects various modules, enabling seamless navigation and interaction within the web application’s architecture.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>- Defines the core server configuration and startup process for the Mindhive application, orchestrating the backend environment that supports user authentication, data management, and API interactions<br>- Serves as the entry point that initializes essential middleware, connects dependencies, and launches the web server, enabling the overall architecture to deliver secure, scalable, and responsive user experiences.</td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- sql Submodule -->
	<details>
		<summary><b>sql</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ sql</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/sql/schema.sql'>schema.sql</a></b></td>
					<td style='padding: 8px;'>- Defines the database schema for a productivity and social platform, establishing core entities such as users, courses, notes, tasks, events, friends, and sessions<br>- Facilitates user management, activity tracking, social interactions, and ranking, supporting the applications architecture by structuring data relationships and ensuring data integrity across features.</td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- src Submodule -->
	<details>
		<summary><b>src</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ src</b></code>
			<!-- utils Submodule -->
			<details>
				<summary><b>utils</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.utils</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/utils/jwt.js'>jwt.js</a></b></td>
							<td style='padding: 8px;'>- Provides core utilities for JWT-based authentication, including generating access and refresh tokens, verifying token validity, and hashing tokens for secure storage<br>- These functions underpin the security architecture by managing user session tokens, enabling reliable authentication workflows, and safeguarding token integrity within the overall application infrastructure.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- controllers Submodule -->
			<details>
				<summary><b>controllers</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.controllers</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/controllers/auth.controller.js'>auth.controller.js</a></b></td>
							<td style='padding: 8px;'>- Defines authentication-related endpoints to manage user registration, login, token refresh, logout, and retrieval of current user information<br>- Facilitates secure user session handling through token management and cookie-based authentication, integrating with the broader application architecture to support user identity and access control across the system.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/controllers/settings.controller.js'>settings.controller.js</a></b></td>
							<td style='padding: 8px;'>- Provides user account management functionalities, enabling password updates and account deletions within the applications settings module<br>- These operations facilitate secure user control over personal data, integrating seamlessly into the broader architecture by interacting with the database to maintain data integrity and support user lifecycle management.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/controllers/pomodoro.controller.js'>pomodoro.controller.js</a></b></td>
							<td style='padding: 8px;'>- Handles recording completed Pomodoro sessions by inserting user-specific session data into the database, facilitating accurate tracking of productivity metrics within the applications architecture<br>- This controller integrates with the broader system to support user engagement and progress monitoring, ensuring seamless data flow between user actions and persistent storage.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/controllers/tasks.controller.js'>tasks.controller.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates task management by handling the creation of new tasks within the application<br>- Integrates with the database to store task details linked to specific users, supporting core functionality for task tracking<br>- Serves as a key component in the controller layer, enabling seamless task addition and ensuring data persistence within the overall project architecture.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- config Submodule -->
			<details>
				<summary><b>config</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.config</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/config/db.js'>db.js</a></b></td>
							<td style='padding: 8px;'>- Establishes a centralized database connection pool for the application, enabling efficient and reliable interactions with the MySQL database<br>- Integrates environment variables for configuration, supporting secure and flexible deployment across different environments<br>- Serves as a foundational component within the overall architecture, facilitating data persistence and retrieval for various features and services.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- middleware Submodule -->
			<details>
				<summary><b>middleware</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.middleware</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/middleware/auth.middleware.js'>auth.middleware.js</a></b></td>
							<td style='padding: 8px;'>- Implements authentication middleware to verify and refresh JSON Web Tokens, ensuring secure user sessions across the application<br>- It manages token validation from cookies or headers, handles token expiration through refresh tokens, and attaches authenticated user data to requests<br>- This component is vital for maintaining secure, persistent user authentication within the overall system architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/middleware/settings.middleware.js'>settings.middleware.js</a></b></td>
							<td style='padding: 8px;'>- Provides validation middleware functions to ensure user requests for password changes and account deletions meet required criteria<br>- It enforces password complexity and presence of user identification, supporting secure and reliable user account management within the applications broader security and user flow architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/middleware/pomodoro.middleware.js'>pomodoro.middleware.js</a></b></td>
							<td style='padding: 8px;'>- Provides middleware functions to ensure user authentication and validate input data for the pomodoro feature<br>- It attaches the authenticated users ID to requests and verifies that submitted points are valid, supporting secure and reliable handling of pomodoro-related operations within the applications architecture.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- routes Submodule -->
			<details>
				<summary><b>routes</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.routes</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/routes/settings.routes.js'>settings.routes.js</a></b></td>
							<td style='padding: 8px;'>- Defines API endpoints for user account management within the settings module, enabling secure password changes and account deletions<br>- Integrates authentication and validation middleware to ensure proper access control and data integrity, facilitating user self-service actions while maintaining overall system security and consistency.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/routes/tasks.routes.js'>tasks.routes.js</a></b></td>
							<td style='padding: 8px;'>- Defines API endpoints for managing user-specific tasks, enabling retrieval and addition of tasks within the application<br>- Integrates authentication to ensure secure access and interacts with the database to perform CRUD operations, supporting the task management functionality integral to the overall project architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/routes/auth.routes.js'>auth.routes.js</a></b></td>
							<td style='padding: 8px;'>- Defines authentication-related API endpoints, facilitating user registration, login, token refresh, and logout processes<br>- Implements route protection for user data retrieval, ensuring only authenticated users can access their profile information<br>- Integrates with middleware for token validation, supporting secure and seamless user session management within the overall application architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/routes/pomodoro.routes.js'>pomodoro.routes.js</a></b></td>
							<td style='padding: 8px;'>- Defines the route for completing a pomodoro session, integrating authentication, user association, and validation middleware to ensure secure and accurate processing<br>- Serves as a key endpoint within the applications architecture for tracking productivity, enabling users to mark pomodoro tasks as complete and update their progress accordingly.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/routes/dashboard.routes.js'>dashboard.routes.js</a></b></td>
							<td style='padding: 8px;'>- Defines the dashboard route, enabling authenticated users to access a personalized overview of their tasks<br>- Integrates user authentication and database queries to retrieve user-specific data, facilitating dynamic rendering of the dashboard view within the applications architecture<br>- This route serves as a key component for delivering tailored user experiences in the system.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- services Submodule -->
			<details>
				<summary><b>services</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.services</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekhatib/mindhive/blob/master/src/services/auth.services.js'>auth.services.js</a></b></td>
							<td style='padding: 8px;'>- Provides core authentication services including user registration, login, token refresh, and logout<br>- Manages user credential verification, generates secure access and refresh tokens, and maintains token validity within the database<br>- Facilitates secure user session management, supporting authentication workflows within the overall application architecture.</td>
						</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** JavaScript
- **Package Manager:** Npm

### Installation

Build mindhive from the source and install dependencies:

1. **Clone the repository:**

   ```sh
   ❯ git clone https://github.com/tarekhatib/mindhive
   ```

2. **Navigate to the project directory:**

   ```sh
   ❯ cd mindhive
   ```

3. **Install the dependencies:**

**Using [npm](https://www.npmjs.com/):**

```sh
❯ npm install
```

### Usage

Run the project with:

**Using [npm](https://www.npmjs.com/):**

```sh
npm start
```

---

## Roadmap

- [x] **`Task 1`**: <strike>Authentication pages.</strike>
- [x] **`Task 2`**: <strike>Dashboard.</strike>
- [ ] **`Task 2.1`**: Pomodoro Timer.
- [x] **`Task 3`**: <strike>Settings.</strike>
- [ ] **`Task 4`**: Notes.
- [ ] **`Task 5`**: To-Do List.
- [ ] **`Task 6`**: Profile.
- [ ] **`Task 7`**: Leaderboard.

## Optional add-ons:

- [ ] **`Task 8`**: Calendar System.
- [ ] **`Task 9`**: Notifications.

---

<div align="left"><a href="#top">⬆ Return To Top</a></div>

---
