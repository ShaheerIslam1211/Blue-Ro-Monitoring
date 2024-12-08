import { collection, query, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getAuth } from "firebase/auth";

// Helper function to create log entry
const createLogEntry = (action) => {
  const auth = getAuth();
  return {
    updatedAt: Date.now(),
    updatedBy: auth.currentUser?.email || 'unknown',
  };
};

export const usersUnderMeService = {
  // Get all users
  async getAllUsers() {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get single user
  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return {
          uid: userDoc.id,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId, updates) {
    try {
      const logEntry = createLogEntry('Updated user data');
      await updateDoc(doc(db, "users", userId), {
        ...updates,
        ...logEntry,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}; 