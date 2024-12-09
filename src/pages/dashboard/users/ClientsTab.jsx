import { useState, useEffect } from "react";
import { useAtom } from 'jotai';
import { clientsAtom } from "@/store/atoms/clientsAtom";
import { SelectSearch } from "@/components/SelectSearch";
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { usersUnderMeService } from "@/services/usersUnderMeService";

export function ClientsTab({ userId }) {
  const [clients] = useAtom(clientsAtom);
  const [userClients, setUserClients] = useState([]); // Array of { clientId, read, write }
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({ 
    clientId: '', 
    read: false, 
    write: false 
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load user's client assignments on mount
  useEffect(() => {
    const loadUserClients = async () => {
      setIsLoading(true);
      try {
        const userData = await usersUnderMeService.getUser(userId);
        if (userData?.clientAccess) {
          const clientsList = Object.entries(userData.clientAccess).map(([clientId, access]) => ({
            clientId,
            read: access.read || false,
            write: access.write || false
          }));
          setUserClients(clientsList);
        }
      } catch (error) {
        console.error('Error loading user clients:', error);
        setMessage({ text: 'Error loading client data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserClients();
  }, [userId]);

  // Get available clients that haven't been added yet
  const availableClients = clients.filter(client => 
    !userClients.some(uc => uc.clientId === client.id)
  );

  const handleAddClient = async () => {
    setIsActionLoading(true);
    try {
      if (!newClient.clientId) {
        setMessage({ text: 'Please select a client', type: 'error' });
        return;
      }

      const updatedClients = [...userClients, { 
        clientId: newClient.clientId,
        read: newClient.read,
        write: newClient.write
      }];

      await usersUnderMeService.updateUser(userId, {
        clientAccess: updatedClients.reduce((acc, client) => ({
          ...acc,
          [client.clientId]: { read: client.read, write: client.write }
        }), {})
      });

      setUserClients(updatedClients);
      setIsAddModalOpen(false);
      setNewClient({ clientId: '', read: false, write: false });
      setMessage({ text: 'Client added successfully!', type: 'success' });
    } catch (error) {
      console.error('Error adding client:', error);
      setMessage({ text: 'Error adding client', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditClient = async () => {
    try {
      const updatedClients = userClients.map(client => 
        client.clientId === selectedClient.clientId ? selectedClient : client
      );

      await usersUnderMeService.updateUser(userId, {
        clientAccess: updatedClients.reduce((acc, client) => ({
          ...acc,
          [client.clientId]: { read: client.read, write: client.write }
        }), {})
      });

      setUserClients(updatedClients);
      setIsEditModalOpen(false);
      setSelectedClient(null);
      setMessage({ text: 'Client updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating client:', error);
      setMessage({ text: 'Error updating client', type: 'error' });
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const updatedClients = userClients.filter(client => client.clientId !== clientId);
      
      await usersUnderMeService.updateUser(userId, {
        clientAccess: updatedClients.reduce((acc, client) => ({
          ...acc,
          [client.clientId]: { read: client.read, write: client.write }
        }), {})
      });

      setUserClients(updatedClients);
      setMessage({ text: 'Client removed successfully!', type: 'success' });
    } catch (error) {
      console.error('Error removing client:', error);
      setMessage({ text: 'Error removing client', type: 'error' });
    }
  };

  const filteredClients = userClients.filter(userClient => {
    const clientData = clients.find(c => c.id === userClient.clientId);
    return clientData?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Modified Add Client Modal content
  const addModalContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Client</label>
        <SelectSearch
          options={availableClients.map(client => ({
            id: client.id,
            name: client.name
          }))}
          value={newClient.clientId}
          onChange={(value) => setNewClient({ ...newClient, clientId: value })}
          displayValue={clients.find(c => c.id === newClient.clientId)?.name}
          placeholder="Search for a client..."
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={newClient.read}
            onChange={(e) => setNewClient({ ...newClient, read: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Read Access</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={newClient.write}
            onChange={(e) => setNewClient({ ...newClient, write: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Write Access</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading client data...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No clients found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Read Access
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Write Access
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((userClient) => {
                const clientData = clients.find(c => c.id === userClient.clientId);
                return (
                  <tr key={userClient.clientId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{clientData?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        userClient.read ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userClient.read ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        userClient.write ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userClient.write ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedClient(userClient);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(userClient.clientId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Client</h3>
            {addModalContent}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.clientId || isActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isActionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Client'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Client: {clients.find(c => c.id === selectedClient.clientId)?.name}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedClient.read}
                    onChange={(e) => setSelectedClient({ ...selectedClient, read: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Read Access</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedClient.write}
                    onChange={(e) => setSelectedClient({ ...selectedClient, write: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Write Access</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditClient}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <XMarkIcon className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}

export default ClientsTab; 