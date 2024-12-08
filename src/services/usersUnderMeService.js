import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
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

// Generate a random ID
const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
  },

  // Check if ID exists
  async checkIdExists(id) {
    const userDoc = await getDoc(doc(db, "users", id));
    return userDoc.exists();
  },

  // Generate unique ID
  async generateUniqueId() {
    let id;
    let exists = true;
    while (exists) {
      id = generateUserId();
      exists = await this.checkIdExists(id);
    }
    return id;
  },

  // Create new user
  async createUser(userData) {
    try {
      if (!userData.id) {
        throw new Error("User ID is required");
      }

      const exists = await this.checkIdExists(userData.id);
      if (exists) {
        throw new Error("User ID already exists");
      }

      const logEntry = createLogEntry('Created user');
      await setDoc(doc(db, "users", userData.id), {
        ...userData,
        ...logEntry,
        createdAt: Date.now(),
        createdBy: getAuth().currentUser?.email || 'unknown',
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}; 