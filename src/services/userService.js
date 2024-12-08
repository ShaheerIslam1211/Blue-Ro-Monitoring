import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

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
      await setDoc(doc(db, "users", uid), {
        ...userData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error setting user data:", error);
      throw error;
    }
  },

  // Update specific user fields
  async updateUserData(uid, updates) {
    console.log(updates);
    try {
      await updateDoc(doc(db, "users", uid), {
        ...updates,
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
      await deleteDoc(doc(db, "users", uid));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}; 