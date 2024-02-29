const mongoose = require("mongoose");
var { UserDB, User, VideoSession } = require("../model/model");
const bcrypt = require("bcrypt");
exports.create = (req, res) => {
  const user = new UserDB({
    active: "yes",
    status: "0",
  });

  user
    .save(user)
    .then((data) => {
      res.send(data._id);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occoured while creating a create operation",
      });
    });
};

exports.leavingUserUpdate = (req, res) => {
  const userid = req.params.id;
  console.log("Leaving userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "no", status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};
exports.updateOnOtherUserClosing = (req, res) => {
  const userid = req.params.id;
  console.log("Leaving userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "yes", status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};

// exports.newUserUpdate = (req, res) => {
//   const userid = req.params.id;
//   console.log("Revisited userid is: ", userid);

//   UserDB.updateOne({ _id: userid }, { $set: { active: "yes" } })
//     .then((data) => {
//       if (!data) {
//         res.status(404).send({
//           message: `Cannot update user with ${userid} Maybe user not found!`,
//         });
//       } else {
//         res.send("1 document updated");
//       }
//     })
//     .catch((err) => {
//       res.status(500).send({ message: "Error update user information" });
//     });
// };
exports.newUserUpdate = (req, res) => {
  const userid = req.params.id;

  // Step 2: Check if the omeID exists in the MongoDB Atlas database
  UserDB.findOne({ _id: userid })
    .then((user) => {
      if (user) {
        // omeID exists in the database, you can proceed with your logic here
        UserDB.updateOne({ _id: userid }, { $set: { active: "yes" } })
          .then((data) => {
            if (!data) {
              res.status(404).send({
                message: `Cannot update user with ${userid} Maybe user not found!`,
              });
            } else {
              res.send("1 document updated");
            }
          })
          .catch((err) => {
            res.status(500).send({ message: "Error update user information" });
          });
        console.log("omeID exists in the database.");
        // Do any further actions here...
      } else {
        // omeID does not exist in the database
        console.log("omeID does not exist in the database.");

        // Step 3: Remove the omeID from localStorage
        // localStorage.removeItem("omeID");

        // Step 4: Create a new user in MongoDB and obtain the new user's ID

        const newUser = new UserDB({
          active: "yes",
          status: "0",
        });
        newUser
          .save(newUser)
          .then((data) => {
            // Obtain the new user's ID from the saved data
            const newUserID = data._id;

            // Step 5: Use the obtained user ID (newUserID) as the new omeID
            var newOmeID = newUserID;

            // Step 6: Store the new omeID in both MongoDB and the browser's localStorage
            // Store the new omeID in localStorage
            // localStorage.setItem("omeID", newOmeID);
            res.send({ omeID: newOmeID });
          })
          .catch((err) => {
            console.error("Error saving new user to the database:", err);
            // Handle any errors that occur during saving the new user
          });
      }
    })
    .catch((err) => {
      console.error("Error querying the database:", err);
      // Handle any errors that occur during database query
    });
};

exports.updateOnEngagement = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { status: "1" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};
exports.updateOnNext = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};
function isValidObjectId(id) {
  // Check if the ID is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    const objectId = new mongoose.Types.ObjectId(id);
    const idString = objectId.toString();

    // Check if the resulting ID string matches the original input
    if (id === idString) {
      return true;
    }
  }

  return false;
}
exports.remoteUserFind = (req, res) => {
  const omeID = req.body.omeID;

  if (isValidObjectId(omeID)) {
    UserDB.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(omeID) },
          active: "yes",
          status: "0",
        },
      },
      { $sample: { size: 1 } },
    ])
      .limit(1)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error occurred while retrieving user information.",
        });
      });
  } else {
    console.log("Invalid ID");
  }
};

exports.getNextUser = (req, res) => {
  const omeID = req.body.omeID;
  const remoteUser = req.body.remoteUser;
  let excludedIds = [omeID, remoteUser];

  UserDB.aggregate([
    {
      $match: {
        _id: { $nin: excludedIds.map((id) => new mongoose.Types.ObjectId(id)) },
        active: "yes",
        status: "0",
      },
    },
    { $sample: { size: 1 } },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error occured while retriving user information.",
      });
    });
};
exports.deleteAllRecords = (req, res) => {
  UserDB.deleteMany({})
    .then(() => {
      res.send("All records deleted successfully");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting all records",
      });
    });
};
const checkEmailExists = async (email) => {
  try {
    const existingUser = await User.findOne({ email });
    return !!existingUser; // Return true if the email exists, false otherwise
  } catch (error) {
    console.error("Error checking email:", error);
    return false; // Return false in case of an error
  }
};
exports.registerUser = async (req, res) => {
  const bcrypt = require("bcrypt");

  try {
    // Extract data from the request body
    const { email, password, confirmPassword } = req.body;
    const emailExists = await checkEmailExists(email);

    if (emailExists) {
      return res
        .status(400)
        .json({ message: "Email already exists in the database." });

      // Handle the case where the email already exists
    } else {
      // console.log("Email is :", confirmPassword);
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user document
      const user = new User({
        email: email,
        password: hashedPassword,
      });

      // Save the user document to the database
      await user.save();

      const userId = user._id;

      // Store the user's _id in the session
      req.session.userId = userId;

      console.log("User id Is: ", userId);

      res.status(201).json({ message: "User registered successfully" });

      console.log("Email is available for registration.");
      // Proceed with user registration
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};
exports.login = async (req, res) => {
  try {
    // Extract data from the request body
    const { inemail, inpassword } = req.body;

    // Fetch the user from the database by email
    const user = await User.findOne({ email: inemail });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(inpassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Set the user's _id in the session
    req.session.userId = user._id;

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};
