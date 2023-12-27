const User = require("../models/User");
const jwt = require("jsonwebtoken");

//handle error
const handelErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };
  //incorrect email
  if (err.message === "Incorrect Email") {
    errors.email = "Email is not Registered";
  }

  //incorrect password
  if (err.message === "Incorrect Password") {
    errors.password = "Password is Incorrect ";
  }

  //duplicate error  :
  if (err.code === 11000) {
    errors.email = "This email is already registered";
    return errors;
  }

  //validation error
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

//jwt tokens
const createToken = (id) => {
  return jwt.sign({ id }, "Golden-State-Warrior-Champions2023", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    // console.log(err);
    const errors = handelErrors(err);
    res.status(400).send({ errors });
  }
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handelErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
