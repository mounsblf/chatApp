import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";


export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if(!fullName || !email || !password) return res.status(400).json({ message: "All fields are required" });
    if(password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if(newUser) {
        generateToken(newUser._id, res);
        await newUser.save();
        res.status(201).json({ _Id:newUser._id, fullName:newUser.fullName, email:newUser.email, profilePicture:newUser.profilePicture });
    }else{
        res.status(400).json({ message: "invalid user data" });
    }

  } catch (error) {
    console.log("error in signup controller",error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const login = (req, res) => {
  res.send("login route");
};



export const logout = (req, res) => {
  res.send("logout route");
};
