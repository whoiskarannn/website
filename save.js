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
  
  _id: mongoose.Schema.Types.ObjectId,
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
});

const student = mongoose.model('students', StudentSchema);
// defining students schema

// Posting data to students table
app.post('/addstudents', async (req, res) => {
  try {
    const studentdata = {
      email: req.body.email,
      rollno: req.body.rollno,
      studentname: req.body.studentname,
      gender: req.body.gender,
      password: req.body.password
    };

    
    const checkEmail = await student.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.send('Email already in use. Please select another email.');
    }

    const studentrollno = await student.findOne({ rollno: req.body.rollno });
        if (studentrollno) {
          return res.send('Roll no already assigned. Please asign another Roll no.');
    }

    const studentname = await student.findOne({ studentname: req.body.studentname });
    if (studentname) {
      return res.send('Name already taken. Please select another Name.');
    }
   
    await student.create(studentdata);
    res.redirect('studentsdata.html');
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


app.post('/add-field', async (req, res) => {
  const { fieldName, fieldValue } = req.body;
  const documentId = '66b430f11964edb18064cea7'; // Replace with the ID of the document you want to update

  try {
      
    const student = mongoose.model('students', StudentSchema);
      const result = await student.updateOne(
          { _id: new ObjectId(documentId) },
          { $set: { [fieldName]: fieldValue } }
      );

      if (result) {
          res.json({ message: 'Field added successfully!' });
      } else {
          res.json({ message: 'No document found with the given ID.' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding field.' });
  } 
});

// adding new field of attendence

app.post('/add-fields', async (req, res) => {
  try {
      const updates = [];
      for (let i = 1; i <= 3; i++) {
          const document = req.body[`document${i}`];

          if (document && document.id) {

            //  if (!studentname.isValid(document.studentname)) {
            //       console.warn(`Invalid studentname format: ${document.studentname}`);
            //       continue;
            //   }
             // Use studentname directly from the document
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
      // console.log('Update results:', resultsa);
      // console.log('something went wrong');

      res.json({ resultsa });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error updating documents');
  }
});


// adding new field of attendence




// displaying chart 
const Studentmarkschema = new mongoose.Schema({
  studentname: String,
  marks: {
    math: Number,
    science: Number,
    english: Number
  }
});

const Students = mongoose.model('StudentsMarks', Studentmarkschema);

// Route to fetch student data
app.get('/student-marks', async (req, res) => {
  try {
    const studentData = await Students.find({}, 'studentname marks').exec();
    res.json(studentData);
  } catch (error) {
    console.error('Error fetching student data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// displaying chart 