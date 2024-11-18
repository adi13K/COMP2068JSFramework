const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const AuthenticationMiddleware = require("../extensions/authentication");

// GET /courses/
router.get("/", async (req, res, next) => {
  try {
    let courses = await Course.find().sort([["name", "ascending"]]);
    res.render("courses/index", { 
      title: "Fitness Tracker - Course List", 
      dataset: courses, 
      user: req.user 
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    next(err); // Pass error to the error handler
  }
});

// GET /courses/add
router.get("/add", AuthenticationMiddleware, (req, res, next) => {
  res.render("courses/add", { 
    title: "Add a New Course - Fitness Tracker", 
    user: req.user 
  });
});

// POST /courses/add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  try {
    let newCourse = new Course({
      name: req.body.name,
      code: req.body.code,
    });
    await newCourse.save();
    res.redirect("/courses");
  } catch (err) {
    console.error("Error adding course:", err);
    next(err); // Pass error to the error handler
  }
});

module.exports = router;
