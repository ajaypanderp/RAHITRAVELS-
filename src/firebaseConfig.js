import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmYjm2HNlnX1TA-5C-e_8EHeq4gZyxv8k",
  authDomain: "rahi-tours-and-travels.firebaseapp.com",
  projectId: "rahi-tours-and-travels",
  storageBucket: "rahi-tours-and-travels.firebasestorage.app",
  messagingSenderId: "456607468009",
  appId: "1:456607468009:web:46ef369722479220566378"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Cloudinary Upload Function
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_unsigned_preset_name"); // REPLACE WITH YOUR PRESET NAME

  const response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  return data.secure_url;
};