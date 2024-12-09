import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getAuth } from "firebase/auth";
import { getDefaultStore } from "jotai";
import { regionsAtom } from "@/store/atoms/regionsAtom";

// Helper function to create log entry
const createLogEntry = (action) => {
  const auth = getAuth();
  return {
    updatedAt: Date.now(),
    updatedBy: auth.currentUser?.email || 'unknown',
    action,
  };
};

// Generate a random ID
const generateRegionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const regionsService = {
  // Check if ID exists
  async checkIdExists(id) {
    const regionDoc = await getDoc(doc(db, "regions", id));
    return regionDoc.exists();
  },

  // Generate unique ID
  async generateUniqueId() {
    let id;
    let exists = true;
    while (exists) {
      id = generateRegionId();
      exists = await this.checkIdExists(id);
    }
    return id;
  },

  // Create new region
  async createRegion(regionData) {
    try {
      if (!regionData.id) {
        throw new Error("Region ID is required");
      }

      const exists = await this.checkIdExists(regionData.id);
      if (exists) {
        throw new Error("Region ID already exists");
      }

      const logEntry = createLogEntry('Created region');
      await setDoc(doc(db, "regions", regionData.id), {
        ...regionData,
        ...logEntry,
        createdAt: Date.now(),
        createdBy: getAuth().currentUser?.email || 'unknown',
      });
    } catch (error) {
      console.error("Error creating region:", error);
      throw error;
    }
  },

  // Delete region
  async deleteRegion(regionId) {
    try {
      await deleteDoc(doc(db, "regions", regionId));
    } catch (error) {
      console.error("Error deleting region:", error);
      throw error;
    }
  },

  // Get all regions
  async getAllRegions() {
    try {
      const regionsRef = collection(db, "regions");
      const querySnapshot = await getDocs(regionsRef);
      const regions = [];
      querySnapshot.forEach((doc) => {
        regions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return regions;
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  },

  // Get single region
  async getRegion(regionId, fetchFromDb = false) {// security issue, fetchFromDb should be false, to avoid non admin access
    try {
      if (fetchFromDb) {
        const regionDoc = await getDoc(doc(db, "regions", regionId));
        if (regionDoc.exists()) {
        return {
          id: regionDoc.id,
          ...regionDoc.data()
        };
      }
      return null;
    }else{
        return getDefaultStore().get(regionsAtom).find(region => region.id === regionId);
    }
    } catch (error) {
      console.error("Error fetching region:", error);
      throw error;
    }
  },

  // Update region
  async updateRegion(regionId, updates) {
    try {
      const logEntry = createLogEntry('Updated region data');
      await updateDoc(doc(db, "regions", regionId), {
        ...updates,
        ...logEntry,
      });
    } catch (error) {
      console.error("Error updating region:", error);
      throw error;
    }
  }
}; 