import React from "react";
import firebase from "firebase/app";
import "firebase/auth";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      // Perform any necessary actions after successful logout
      console.log("Logged out successfully");
    } catch (error) {
      console.log("Logout failed:", error.message);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
