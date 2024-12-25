import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";



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



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate token and send response
    generateToken(user._id, res);
    
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};



export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {

    const { profilePicture } = req.body;
    const user = req.user._id;

    if(!profilePicture) return res.status(400).json({ message: "Profile picture is required" });

    const uploadResponse = await cloudinary.uploader.upload(profilePicture);

    const updatedUser = await User.findByIdAndUpdate(user, { profilePicture: uploadResponse.secure_url }, { new: true });

    res.status(200).json({ user: updatedUser });

  } catch (error) {

    console.log("error in update profile controller",error);
    res.status(500).json({ message: "Internal server error" });

  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("error in check auth controller",error);
    res.status(500).json({ message: "Internal server error" });
  }
};