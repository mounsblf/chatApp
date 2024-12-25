import User from "../models/user.models.js";
import Message from "../models/message.models.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUser } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id:userToChatID } = req.params;
    const myID = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderID: myID, receiverID: userToChatID },
        { senderID: userToChatID, receiverID: myID },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id:userToChatID } = req.params;
    const myID = req.user._id;

    let imageURL;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      text,
      image: imageURL,
      senderID: myID,
      receiverID: userToChatID,
    });

    await newMessage.save();

    //todo: realtime functionality goes here => socket.io

    



    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};