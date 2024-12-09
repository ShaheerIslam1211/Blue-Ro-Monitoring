import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getAuth } from "firebase/auth";
import { plantsAtom } from "@/store/atoms/plantsAtom";
import { getDefaultStore } from "jotai";

// Helper function to create log entry
const createLogEntry = (action) => {
  const auth = getAuth();
  return {
    updatedAt: Date.now(),
    updatedBy: auth.currentUser?.email || 'unknown',
  };
};

// Generate a random ID
const generatePlantId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const plantsService = {
  // Check if ID exists
  async checkIdExists(id) {
    const plantDoc = await getDoc(doc(db, "plants", id));
    return plantDoc.exists();
  },

  // Generate unique ID
  async generateUniqueId() {
    let id;
    let exists = true;
    while (exists) {
      id = generatePlantId();
      exists = await this.checkIdExists(id);
    }
    return id;
  },

  // Create new plant
  async createPlant(plantData) {
    try {
      if (!plantData.id) {
        throw new Error("Plant ID is required");
      }

      const exists = await this.checkIdExists(plantData.id);
      if (exists) {
        throw new Error("Plant ID already exists");
      }

      const logEntry = createLogEntry('Created plant');
      await setDoc(doc(db, "plants", plantData.id), {
        ...plantData,
        ...logEntry,
        createdAt: Date.now(),
        createdBy: getAuth().currentUser?.email || 'unknown',
      });
    } catch (error) {
      console.error("Error creating plant:", error);
      throw error;
    }
  },

  // Delete plant
  async deletePlant(plantId) {
    try {
      await deleteDoc(doc(db, "plants", plantId));
    } catch (error) {
      console.error("Error deleting plant:", error);
      throw error;
    }
  },

  // Get all plants
  async getAllPlants() {
    try {
      const plantsRef = collection(db, "plants");
      const querySnapshot = await getDocs(plantsRef);
      const plants = [];
      querySnapshot.forEach((doc) => {
        plants.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return plants;
    } catch (error) {
      console.error("Error fetching plants:", error);
      throw error;
    }
  },

  // Get single plant
  async getPlant(plantId, fetchFromDb = false) {// security issue, fetchFromDb should be false, to avoid non admin access
    try {
      if (fetchFromDb) {
        const plantDoc = await getDoc(doc(db, "plants", plantId));
        if (plantDoc.exists()) {
        return {
          id: plantDoc.id,
          ...plantDoc.data()
        };
      }
      return null;
    }else{
        return getDefaultStore().get(plantsAtom).find(plant => plant.id === plantId);
    }
    } catch (error) {
      console.error("Error fetching plant:", error);
      throw error;
    }
  },

  // Update plant
  async updatePlant(plantId, updates) {
    try {
      const logEntry = createLogEntry('Updated plant data');
      await updateDoc(doc(db, "plants", plantId), {
        ...updates,
        ...logEntry,
      });
    } catch (error) {
      console.error("Error updating plant:", error);
      throw error;
    }
  }
}; 