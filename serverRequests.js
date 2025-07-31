// Import the necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

// Import collections from mongoDB server
const {
  USER,
  EDUCATION,
  LINKS,
  PROJECTS,
  SKILLS,
} = require("./mongoServer.js");
const accessGetPost = express();
accessGetPost.use(bodyParser.json());
accessGetPost.set("json spaces", 3);
const { ObjectId } = require('mongodb');

// GET to the server welcome page
accessGetPost.get(`/`, (req, res) => {
  res.send("Welcome to the server side of my resume");
});

// Try catch for any errors when trying to fetch the requests
// Finding all the documents from the collection that match with the queries
// Sending the response as a json format

// GET webpage owner information
accessGetPost.get(`/Owner`, async (req, res) => {
  try {
    const owner = await USER.find({ name: "Alam" }).toArray();
    res.json(owner);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting the owner of this webpage with internal server: ${error}`,
    });
  }
});

// GET for all the links related to the user
accessGetPost.get(`/Links/:userId`, async (req, res) => {
  if (!ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
  const userId = new ObjectId(req.params.userId);

  try {
    const user = await USER.findOne({ _id: userId }); // Find user by id

    if (!user || !Array.isArray(user.links) || user.links.length === 0) {
      return res.json([]);
    };

    const links = await LINKS.find({ _id: { $in: user.links } }).toArray(); // Get all the links related to the user id provided

    res.json(links);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching links for the current user: ${error}`,
    });
  }
});

// GET for an Specific Education
accessGetPost.get(/^\/Education\/([a-f\d]{24})$/, async (req, res) => {
  const eduID = req.params[0];

  if (!mongoose.Types.ObjectId.isValid(eduID)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid education ID format" });
  }

  try {
    const education = await EDUCATION.findById(eduID);
    if (!education) {
      return res.status(404).json({ success: false, message: "Education not found" });
    }
    res.json(education);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting the education with internal server: ${error}`,
    });
  }
});

// GET for all the skills
accessGetPost.get(`/Skills/:userId`, async (req, res) => {
  if (!ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
  const userId = new ObjectId(req.params.userId);

  try {
    const user = await USER.findOne({ _id: userId });

    if (!user || !Array.isArray(user.skills) || user.skills.length === 0) {
      return res.json([]);
    };

    const skills = await SKILLS.find({ _id: { $in: user.skills } }).toArray();

    res.json(skills);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting the skills for the current user: ${error}`,
    });
  }
});

// GET for all the projects
accessGetPost.get(`/Projects/:userId`, async (req, res) => {
  if (!ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
  const userId = new ObjectId(req.params.userId);
  try {
    const user = await USER.findOne({ _id: userId });

    if (!user || !Array.isArray(user.projects) || user.projects.length === 0) {
      return res.json([]);
    };

    const projects = await PROJECTS.find({ _id: { $in: user.projects } }).toArray();

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting the projects for the current user: ${error}`,
    });
  }
});

// // POST for searched lessons
// accessGetPost.post(`/search`, async (req, res) => {
//   try {
//     const searchQ = req.body;
//     // If method to return an empty array if the search space is empty
//     if (!searchQ.searchTerm || searchQ.searchTerm.trim() === "") {
//       res.json([]);
//     } else {
//       const query = {
//         // Constructor for the mongoDB query to match the search
//         $or: [
//           { subject: { $regex: new RegExp(searchQ.searchTerm, "i") } },
//           { location: { $regex: new RegExp(searchQ.searchTerm, "i") } },
//           {
//             price: isNaN(Number(searchQ.searchTerm))
//               ? { $regex: new RegExp(searchQ.searchTerm, "i") }
//               : Number(searchQ.searchTerm),
//           },
//           {
//             available: isNaN(Number(searchQ.searchTerm))
//               ? { $regex: new RegExp(searchQ.searchTerm, "i") }
//               : Number(searchQ.searchTerm),
//           },
//         ],
//       };
//       // Implements the query search on the productsCollection and returns it in an array
//       const results = await productsCollection.find(query).toArray();
//       res.json(results);
//     }
//   } catch (error) {
//     res.status(500).json({ err: "Internal server error when searching" });
//   }
// });

// //POST for new orders
// accessGetPost.post(`/placeOrder`, async (req, res) => {
//   try {
//     // Try catch for any errors of the req.body
//     const data = req.body;
//     data.id = await generateUniqueID(); // Assigned the id to the order data in the body of the request, once generated and confirmed
//     await ordersCollection.insertOne(data); // Insert the order data in the orders collection
//     res.json({ success: true, order: data }); // Send a response with the orders data back
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Error placing the order with internal server: ${error}`,
//     });
//   }
// });

// //PUT for updating the lessons
// accessGetPost.put(`/updateLessons`, async (req, res) => {
//   try {
//     // Try catch for any errors of the req.body
//     const data = req.body;
//     console.log(data.purchasedLessonsID);
//     for (let lessonID of data.purchasedLessonsID) {
//       // Looping through all the elements in the data inside the request
//       const filter = { id: lessonID };
//       const update = { $inc: { available: -1 } };
//       await productsCollection.updateOne(filter, update); // For each element found with specific id, update the vailable value
//     }
//     res.json({ success: true, message: "Lessons updated successfully." }); // Return a successful response
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Error updating the lessons with internal server: ${error}`,
//     });
//   }
// });

module.exports = accessGetPost; // Export all the functions
