import React from "react";
import { useState, Fragment } from "react";
import { useAtom } from 'jotai';
import { usersAtom } from "@/store/atoms/usersAtom";
import { usersUnderMeService } from "@/services/usersUnderMeService";
import {
  UserCircleIcon,
  PhoneIcon,
  BellIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, Transition } from '@headlessui/react';
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { canAccessUsers } from '@/helper/canDoCheck';

export function Users() {
  if (!canAccessUsers()) {
    return (
      <div className="mt-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to manage users.</p>
      </div>
    );
  }

  const [users, setUsers] = useAtom(usersAtom);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await usersUnderMeService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateId = async () => {
    try {
      const id = await usersUnderMeService.generateUniqueId();
      setNewUser(prev => ({ ...prev, id }));
    } catch (error) {
      setError('Error generating ID');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAddingUser(true);
    try {
      const uid= await usersUnderMeService.createUser(newUser);
      setUsers((prevUsers) => [...prevUsers, { ...newUser, id: uid }]);
      setIsOpen(false);
      navigate(`/dashboard/users/${uid}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingUser(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setDeletingUserId(userId);
      try {
        await usersUnderMeService.deleteUser(userId);
        setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setDeletingUserId(null);
      }
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Users Management</h1>
          <div className="flex gap-2">
            <button
              onClick={refreshUsers}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <PlusIcon className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notifications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.phone || 'N/A'}</span>
                       
                      </div>
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-gray-900 truncate block overflow-hidden">
                        {user.notes || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className={`text-sm ${user.receive_notification ? 'text-green-600' : 'text-red-600'}`}>
                          {user.receive_notification ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="group relative cursor-help">
                          <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</span>
                          {user.updatedAt && (
                            <span className="invisible group-hover:visible absolute left-0 -bottom-6 bg-gray-800 text-white text-xs rounded py-1 px-2">
                              {new Date(user.updatedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {user.updatedBy && (
                          <div className="text-xs text-gray-400">
                            by {user.updatedBy}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/dashboard/users/${user.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors ${deletingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}

        {/* Add User Modal */}
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add New User
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Enter user email"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Enter password"
                          required
                          minLength="6"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Enter user name"
                          required
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-red-600">
                          {error}
                        </div>
                      )}

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg ${addingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={addingUser}
                        >
                          {addingUser ? 'Adding...' : 'Create User'}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}

export default Users; 