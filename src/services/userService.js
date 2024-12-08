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
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
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
  async setUserData(uid, userData) {
    try {
      const logEntry = createLogEntry('Created/Updated user profile');
      await setDoc(doc(db, "users", uid), {
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
  async updateUserData(uid, updates) {
    try {
      const logEntry = createLogEntry('Updated user profile');
      await updateDoc(doc(db, "users", uid), {
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
  async deleteUserData(uid) {
    try {
      // Log before deletion
      const logEntry = createLogEntry('Deleted user');
      await updateDoc(doc(db, "users", uid), logEntry);
      await deleteDoc(doc(db, "users", uid));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}; 