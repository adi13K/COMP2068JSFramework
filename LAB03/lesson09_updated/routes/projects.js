// Naming convention > controllers/routers are plural
const express = require("express");
const router = express.Router();
// Import mongoose models
const Project = require("../models/project");
const Course = require("../models/course");
// Import reusable authentication middleware
const AuthenticationMiddleware = require("../extensions/authentication");

// Configure GET/POST handlers
// Path relative to the one configured in app.js > /projects

// GET /projects/
router.get("/", async (req, res, next) => {
  // Retrieve ALL data, and sort by dueDate
  let projects = await Project.find().sort([["dueDate", "descending"]]);
  // Render view
  res.render("projects/index", {
    title: "Fitness Tracker - Projects",
    dataset: projects,
    user: req.user,
  });
});

// GET /projects/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  let courseList = await Course.find().sort([["name", "ascending"]]);
  res.render("projects/add", {
    title: "Add a New Project",
    courses: courseList,
    user: req.user,
  });
});

// POST /projects/add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  let newProject = new Project({
    name: req.body.name,
    dueDate: req.body.dueDate,
    course: req.body.course,
  });
  await newProject.save();
  res.redirect("/projects");
});

// GET /projects/delete/:_id
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let projectId = req.params._id;
  await Project.findByIdAndRemove({ _id: projectId });
  res.redirect("/projects");
});

// GET /projects/edit/:_id
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let projectId = req.params._id;
  let projectData = await Project.findById(projectId);
  let courseList = await Course.find().sort([["name", "ascending"]]);
  res.render("projects/edit", {
    title: "Edit Project Info",
    project: projectData,
    courses: courseList,
    user: req.user,
  });
});

// POST /projects/edit/:_id
router.post("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let projectId = req.params._id;
  await Project.findByIdAndUpdate(
    { _id: projectId }, // Filter to find the project to update
    {
      // Updated data
      name: req.body.name,
      dueDate: req.body.dueDate,
      course: req.body.course,
      status: req.body.status,
    }
  );
  res.redirect("/projects");
});

// Export router object
module.exports = router;
