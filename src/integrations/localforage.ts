import localforage from 'localforage';

// Configure localforage for your application
export const offlineStore = localforage.createInstance({
  name: 'exome-offline-store', // Name of the database
  storeName: 'transactions', // Name of the object store
  description: 'Stores transactions and other data for offline use',
});

// You can create other instances for different types of data if needed
// export const settingsStore = localforage.createInstance({
//   name: 'exome-offline-store',
//   storeName: 'settings',
//   description: 'Stores user settings offline',
// });