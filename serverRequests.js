// Import the necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

// Import collections from mongoDB server
const {
  USER,
  EDUCATION,
  LINKS,
  PROJECTS,
  SKILLS,
  MESSAGES
} = require("./mongoServer.js");
const accessGetPost = express();
accessGetPost.use(bodyParser.json());
accessGetPost.set("json spaces", 3);
const { ObjectId } = require('mongodb');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendNotificationEmail(toEmail, fromName, fromEmail, messageContent) {
  const mailOptions = {
    from: `"Personal Resume Inbox" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `New message from ${fromName}`,
    text: `You have received a new message.\n\nFrom: ${fromName} <${fromEmail}>\n\nMessage:\n${messageContent}`,
    html: `<p>You have received a new message.</p>
           <p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
           <p><strong>Message:</strong><br>${messageContent.replace(/\n/g, "<br>")}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Notification email sent!");
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

// GET to the server welcome page
accessGetPost.get(`/`, (req, res) => {
  res.send("Welcome to the server side of my resume");
});

// Try catch for any errors when trying to fetch the requests
// Finding all the documents from the collection that match with the queries
// Sending the response as a json format

// GET for the owner information
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

// GET for an specific education of the user
accessGetPost.get(`/Education/:educationId`, async (req, res) => {
  console.log(req);
  if (!ObjectId.isValid(req.params.educationId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
  const educationId = new ObjectId(req.params.educationId);

  try {
    const education = await EDUCATION.findOne({ _id: educationId });

    if (!education) {
      return res.status(404).json({ success: false, message: "Education not found" });
    };

    res.json(education);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting the education with internal server: ${error}`,
    });
  }
});

// GET for all the skills related to the user
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

// GET for all the projects related to the user
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

// POST to send a direct message to the user
accessGetPost.post('/SendNewMessage', async (req, res) => {
  try {
    const { userId, name, email, message } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const trimmedName = name.trim();
    const nameHasNumbers = /\d/.test(trimmedName);
    const nameParts = trimmedName.split(" ").filter(Boolean);
    const emailRegexCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(email);
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (nameHasNumbers) {
      return res.status(400).json({ error: "Name cannot contain numbers." });
    }
    if (nameParts.length < 2) {
      return res.status(400).json({ error: "Please enter both first name and surname." });
    }
    if (trimmedName.length > 50) {
      return res.status(400).json({ error: "Full name cannot exceed 50 characters." });
    }
    if (nameParts.some(part => part.length > 25)) {
      return res.status(400).json({ error: "Each part of the name must be 25 characters or less." });
    }
    if (!emailRegexCheck) {
      return res.status(400).json({ error: "Invalid email address." });
    }
    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }
    if (trimmedMessage.length > 300) {
      return res.status(400).json({ error: "Message cannot exceed 300 characters." });
    }

    // const userObjectId = new ObjectId(userId);
    // const user = await USER.findOne({ _id: userObjectId });
    const user = await USER.findOne({ _id: userId });

    if (!user || !Array.isArray(user.inbox)) {
      return res.status(404).json({ error: "User ID not found or inbox structure not present" })
    }

    const newMessage = {
      fromName: trimmedName,
      fromEmail: email,
      content: trimmedMessage,
      date: new Date()
    };

    const insertResponse = await MESSAGES.insertOne(newMessage);
    const messageId = insertResponse.insertedId;

    await USER.updateOne(
      { _id: userId },
      { $push: { inbox: messageId } }
    );

    await sendNotificationEmail(
      user.contact.email,   
      newMessage.fromName,  
      newMessage.fromEmail, 
      newMessage.content
    );

    return res.status(200).json({ message: "Message sent successfully." });

  } catch (error) {
    console.error("Error sending a new message to user:", error);
    return res.status(500).json({ error });
  }
});

module.exports = accessGetPost; // Export all the functions
