const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { ObjectId } = mongoose.Types;
const path = require('path');
const app = express();
const port = 3019;

// MongoDB connection URI
// const uri = 'mongodb://localhost:27017/mydb';

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB using mongoose
mongoose.connect('mongodb://localhost:27017/mydb')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('Connection failed:', error.message);
  });

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/addteachers', (req, res) => {
  res.sendFile(path.join(__dirname, 'addteachers.html'));
});

app.get('/addstudents', (req, res) => {
  res.sendFile(path.join(__dirname, 'addstudents.html'));
});

app.get('/teacherslogin', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacherslogin.html'));
});

app.get('/todays_remark', (req, res) => {
  res.sendFile(path.join(__dirname, 'todays_remark.html'));
});

app.get('/studentslogin', (req, res) => {
  res.sendFile(path.join(__dirname, 'studentslogin.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Defining schema for signup
const SignupSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const Teacher = mongoose.model('teachers', SignupSchema);

// Posting data to teachers table
app.post('/addteachers', async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    };

    
    const checkEmail = await Teacher.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.send('Email already in use. Please select another email.');
    }

    const checkUsername = await Teacher.findOne({ username: req.body.username });
    if (checkUsername) {
      return res.send('Username already taken. Please select another username.');
    }

    await Teacher.create(data);
    res.redirect('home.html');
  } catch (error) {
    console.error('Error inserting data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Fetching and analyzing provided data for login
app.post('/teacherslogin', async (req, res) => {
  try {
    const check = await Teacher.findOne({ username: req.body.username });
    if (check && check.password === req.body.password) {
      res.redirect('home.html');
    } else {
      res.send('Wrong user name or password');
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// display user info
// display user info

// Get data from teachers table
app.get('/data', async (req, res) => {
  try {
    const results = await Teacher.find().exec();
    res.json(results);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// Get data from teachers table

// defining students schema
const StudentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  rollno: {
    type: String,
    required: true
  },
  studentname: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { strict: false }); 

const student = mongoose.model('students', StudentSchema);
// defining students schema

// Posting data to students table
app.post('/addstudents', async (req, res) => {
  try {
    const { email, rollno, studentname, gender, password } = req.body;

    // Check if email, rollno, or studentname already exists
    const checkEmail = await student.findOne({ email });
    if (checkEmail) {
      return res.status(400).send('Email already in use. Please select another email.');
    }

    const studentrollno = await student.findOne({ rollno });
    if (studentrollno) {
      return res.status(400).send('Roll no already assigned. Please assign another Roll no.');
    }

    const studentnameExists = await student.findOne({ studentname });
    if (studentnameExists) {
      return res.status(400).send('Name already taken. Please select another Name.');
    }

    // Create new student
    const newStudent = new student({ email, rollno, studentname, gender, password });
    await newStudent.save();

    res.status(201).send('Student added successfully!');
  } catch (error) {
    console.error('Error inserting data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Posting data to students table
// showing students data
app.get('/studentdata', async (req, res) => {
  try {
    const results = await student.find().exec();
    res.json(results);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// showing students data
// Updating a student's information
app.put('/updatestudent/:rollno', async (req, res) => {
  try {
    const { rollno } = req.params;
    const updates = req.body;

    const updatedStudent = await student.findOneAndUpdate({ rollno }, updates, { new: true });

    if (!updatedStudent) {
      return res.status(404).send('Student not found.');
    }

    res.status(200).send('Student updated successfully!');
  } catch (error) {
    console.error('Error updating data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// Updating a student's information
// Deleting a student's information
app.delete('/deletestudent/:rollno', async (req, res) => {
  try {
    const { rollno } = req.params;

    const deletedStudent = await student.findOneAndDelete({ rollno });

    if (!deletedStudent) {
      return res.status(404).send('Student not found.');
    }

    res.status(200).send('Student deleted successfully!');
  } catch (error) {
    console.error('Error deleting data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// Deleting a student's information


// adding new field of attendence

app.post('/add-fields', async (req, res) => {
  try {
      const updates = [];
      for (let i = 1; i <= 15; i++) {
          const document = req.body[`document${i}`];

          if (document && document.id) {
               const existingDocument = await student.findOne({ _id: document.id });
              if (!existingDocument) {
                  console.warn(`Document with ID ${document.id} does not exist`);
                  continue;
              }

              console.log(`Processing document ${i}:`, document);

              const query = { _id: new ObjectId(document.id) };
              const update = { $set: { [document.fieldName]: document.fieldValue } };
              const result = await student.updateOne(query, update);

              if (result) {
                
                  console.log(`Document ${i} updated successfully.`);
                  
              } else {
                  console.warn(`No document found with the given ID. ${i}.`);
              }

              updates.push(result);
          } else {
              console.warn(`Document ${i} is missing or has no ID`);
          }
      }

      const resultsa = await Promise.all(updates);
     

      res.json({ resultsa });
      
      
  } catch (err) {
      console.error(err);
      res.status(500).send('Error updating documents');
  }
});

// adding new field of attendence





// Route to fetch attendance data
app.get('/attendance-summary', async (req, res) => {
  try {
      const results = await student.aggregate([
          { $project: { _id: 0, attendance: { $objectToArray: "$$ROOT" } } },
          { $unwind: "$attendance" },
          { $match: { "attendance.v": { $in: ["p", "a"] } } },
          { $group: { _id: "$attendance.k", countP: { $sum: { $cond: [{ $eq: ["$attendance.v", "p"] }, 1, 0] } }, countA: { $sum: { $cond: [{ $eq: ["$attendance.v", "a"] }, 1, 0] } } } },
          { $sort: { _id: 1 } }
      ]).exec();

      // Transform the results into a format suitable for Chart.js
      const dates = results.map(item => item._id);
      const totalP = results.map(item => item.countP);
      const totalA = results.map(item => item.countA);

      res.json({ dates, totalP, totalA });
  } catch (error) {
      console.error('Error fetching attendance data:', error.message);
      res.status(500).send('Internal Server Error');
  }
});
// displaying chart 
// displaying each student donut chart
app.get('/attendance-data', async (req, res) => {
  try {
      const month = req.query.month; // Expected format: YYYY-MM

      // Fetch all students from the database
      const students = await student.find({});

      const attendanceData = students.map(student => {
          const studentObj = student.toObject();
          const monthRegex = month ? new RegExp(`^${month}`) : null;

          // Calculate total present and absent based on filtered data for the selected month
          const filteredAttendance = Object.keys(studentObj)
              .filter(field => monthRegex && monthRegex.test(field)) // Match date fields to the selected month
              .reduce((acc, date) => {
                  if (studentObj[date] === 'p') acc.totalPresent += 1;
                  if (studentObj[date] === 'a') acc.totalAbsent += 1;
                  return acc;
              }, { totalPresent: 0, totalAbsent: 0 });

          return {
              studentname: studentObj.studentname,
              totalPresent: filteredAttendance.totalPresent,
              totalAbsent: filteredAttendance.totalAbsent
          };
      });

      res.json(attendanceData);
  } catch (error) {
      console.error('Error fetching attendance data:', error);
      res.status(500).send('Error fetching attendance data');
  }
});

// Route to fetch all student data (without filtering)
app.get('/studentsttrdata', async (req, res) => {
  try {
      const results = await student.find().exec();
      res.json(results);
  } catch (error) {
      console.error('Error fetching data:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

// view attendence report