import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getAuth } from "firebase/auth";

// Helper function to create log entry
const createLogEntry = (action) => {
  const auth = getAuth();
  return {
    lastUpdatedAt: Date.now(),
    lastUpdatedBy: auth.currentUser?.email || 'unknown',
  };
};

export const userService = {
  // Get user data
  async getUserData(id) {
    try {
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Create/Update user data
  async setUserData(id, userData) {
    try {
      const logEntry = createLogEntry('Created/Updated user profile');
      await setDoc(doc(db, "users", id), {
        ...userData,
        ...logEntry,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error setting user data:", error);
      throw error;
    }
  },

  // Update specific user fields
  async updateUserData(id, updates) {
    try {
      const logEntry = createLogEntry('Updated user profile');
      await updateDoc(doc(db, "users", id), {
        ...updates,
        ...logEntry,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user data
  async deleteUserData(id) {
    try {
      // Log before deletion
      const logEntry = createLogEntry('Deleted user');
      await updateDoc(doc(db, "users", id), logEntry);
      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}; 