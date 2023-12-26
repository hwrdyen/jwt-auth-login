const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// library for signing and verifying JWT tokens
const jwt = require("jsonwebtoken");

const cors = require("cors");

require("dotenv").config();

app.use(express.json());
app.use(cors());

const users = {
  Howie: {
    name: "Howie",
    password: "test",
  },
};

const authorize = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "No token found" });
  }
  const authTokenArray = req.headers.authorization.split(" ");
  if (
    authTokenArray[0].toLowerCase() !== "bearer" &&
    authTokenArray.length !== 2
  ) {
    return res.status(401).json({ message: "Invalid token" });
  }

  jwt.verify(authTokenArray[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "The token is expired or invalid" });
    }
    req.jwtPayload = decoded;
    next();
  });
};
// login endpoint
app.post("/login", (req, res) => {
  console.log();
  const { username, password } = req.body;

  const user = users[username];

  if (!user) {
    return res
      .status(403)
      .json({ message: "This user doesn't exist. Please sign up!" });
  }

  if (user.password === password) {
    // Generate a token and send it back
    const token = jwt.sign(
      {
        name: user.name,
        username: username,
        loginTime: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "3m" }
    );
    return res.status(200).json({ token });
  } else {
    return res.status(403).json({ message: "Invalid username or password" });
  }
});

// a protected route, note we are using a second parameter "authorize" which is our middleware for authentication
// app.get('/profile', authorize, (req, res) => {

// });

// // another route that requires authentication
app.get("/super-secret", authorize, (req, res) => {
  console.log(req.jwtPayload);
  res.json({
    superSecretMessage: "I spend way too much time styling my terminal",
  });
});

app.get("/profile", authorize, (req, res) => {
  res.json({
    tokenInfo: req.jwtPayload,
    sensitiveInformation: {
      secret:
        "Old school RPGs, terrible terrible puns, Lo-fi beats to relax/study to",
    },
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
