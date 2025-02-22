const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware for reading JSON in requests

// Data store
let users = [{ id: "1", firstName: "Anshika", lastName: "Agarwal", hobby: "Teaching" }];

// Logging Middleware (Logs Method, URL, Status)
app.use((req, res, next) => {
    const startTime = new Date();
    res.on("finish", () => {  
        const duration = new Date() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
    });
    next(); 
});

// Validation Middleware (For POST & PUT)
const validateUser = (req, res, next) => {
    let { firstName, lastName, hobby } = req.body;

    // Trim spaces
    firstName = firstName?.trim();
    lastName = lastName?.trim();
    hobby = hobby?.trim();

    // Required fields validation
    if (!firstName || !lastName || !hobby) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Name validation
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        return res.status(400).json({ error: "Names must contain only alphabets" });
    }

    // Length validations
    if (firstName.length < 2 || firstName.length > 20) {
        return res.status(400).json({ error: "First Name must be 2-20 characters long" });
    }
    if (lastName.length < 2 || lastName.length > 20) {
        return res.status(400).json({ error: "Last Name must be 2-20 characters long" });
    }
    if (hobby.length < 3 || hobby.length > 30) {
        return res.status(400).json({ error: "Hobby must be 3-30 characters long" });
    }

    // Attach cleaned data to request body
    req.body = { firstName, lastName, hobby };
    next();
};

// Routes

// GET - Fetch all users
app.get("/users", (req, res) => {
    res.status(200).json(users);
});

// GET - Fetch user by ID
app.get("/users/:id", (req, res) => {
    const foundUser = users.find(user => user.id === req.params.id);
    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(foundUser);
});

// POST - Add a new user (Uses Validation Middleware)
app.post("/user", validateUser, (req, res) => { 
    const { firstName, lastName, hobby } = req.body;

    // Check if a user with the same first and last name exists
    const isDuplicate = users.some(user => user.firstName === firstName && user.lastName === lastName);
    if (isDuplicate) {
        return res.status(400).json({ error: "User with the same first and last name already exists" });
    }

    const newUser = { id: (users.length + 1).toString(), firstName, lastName, hobby };
    users.push(newUser);
    res.status(201).json({ message: "User added successfully", user: newUser });
});

// PUT - Update user details (Uses Validation Middleware)
app.put("/user/:id", validateUser, (req, res) => {
    const userIndex = users.findIndex(user => user.id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users[userIndex] = { id: req.params.id, ...req.body };
    res.status(200).json({ message: "User updated successfully", user: users[userIndex] });
});

// DELETE - Remove a user
app.delete("/user/:id", (req, res) => {
    const userIndex = users.findIndex(user => user.id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users.splice(userIndex, 1);
    res.status(200).json({ message: "User removed successfully" });
});

// 404 Error Handling Middleware
app.use((req, res) => {
    res.status(404).json({ error: "Invalid route" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
