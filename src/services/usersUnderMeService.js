import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getAuth } from "firebase/auth";
import axios from 'axios';
import { getDefaultStore } from "jotai";
import { usersAtom } from "@/store/atoms/usersAtom";

const API_URL = 'https://shaheer1211.pythonanywhere.com';

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
          id: doc.id,
          ...doc.data()
        });
      });
      return users.filter(user => user.id !== getAuth().currentUser?.uid);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get single user
  async getUser(userId) {
    try {
      return getDefaultStore().get(usersAtom).find(user => user.id === userId);// no need to fetch from db, possible security issue,
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
      // First create Firebase auth user
      const response = await axios.post(`${API_URL}/create-user`, {
        email: userData.email,
        password: userData.password
      });
      
      const uid = response.data.uid;
      
      // Then create Firestore user document
      const logEntry = createLogEntry('Created user');
      await setDoc(doc(db, "users", uid), {
        email: userData.email,
        name: userData.name,
        ...logEntry,
        createdAt: Date.now(),
        createdBy: getAuth().currentUser?.email || 'unknown',
      });
      
      return uid;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      // First delete from Firebase Auth
      await axios.delete(`${API_URL}/delete-user`, {
        data: { uid: userId }
      });
      
      // Then delete from Firestore
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}; 