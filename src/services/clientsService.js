import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
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
const generateClientId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const clientsService = {
  // Check if ID exists
  async checkIdExists(id) {
    const clientDoc = await getDoc(doc(db, "clients", id));
    return clientDoc.exists();
  },

  // Generate unique ID
  async generateUniqueId() {
    let id;
    let exists = true;
    while (exists) {
      id = generateClientId();
      exists = await this.checkIdExists(id);
    }
    return id;
  },

  // Create new client
  async createClient(clientData) {
    try {
      if (!clientData.id) {
        throw new Error("Client ID is required");
      }

      const exists = await this.checkIdExists(clientData.id);
      if (exists) {
        throw new Error("Client ID already exists");
      }

      const logEntry = createLogEntry('Created client');
      await setDoc(doc(db, "clients", clientData.id), {
        ...clientData,
        ...logEntry,
        createdAt: Date.now(),
        createdBy: getAuth().currentUser?.email || 'unknown',
      });
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },

  // Delete client
  async deleteClient(clientId) {
    try {
      await deleteDoc(doc(db, "clients", clientId));
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  // Get all clients
  async getAllClients() {
    try {
      const clientsRef = collection(db, "clients");
      const querySnapshot = await getDocs(clientsRef);
      const clients = [];
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return clients;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  // Get single client
  async getClient(clientId) {
    try {
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (clientDoc.exists()) {
        return {
          id: clientDoc.id,
          ...clientDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching client:", error);
      throw error;
    }
  },

  // Update client
  async updateClient(clientId, updates) {
    try {
      const logEntry = createLogEntry('Updated client data');
      await updateDoc(doc(db, "clients", clientId), {
        ...updates,
        ...logEntry,
      });
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }
}; 