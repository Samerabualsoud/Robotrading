import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types
interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Notification[];
  currentView: string;
  isMobile: boolean;
  dialogOpen: {
    newTrade: boolean;
    accountSettings: boolean;
    modelSettings: boolean;
    confirmTrade: boolean;
  };
  dialogData: any;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  darkMode: true,
  notifications: [],
  currentView: 'dashboard',
  isMobile: window.innerWidth < 768,
  dialogOpen: {
    newTrade: false,
    accountSettings: false,
    modelSettings: false,
    confirmTrade: false,
  },
  dialogData: null,
};

// Create slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const id = Date.now().toString();
      state.notifications.unshift({
        ...action.payload,
        id,
        timestamp: new Date().toISOString(),
        read: false,
      });
      
      // Keep only the latest 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      
      // Auto-close sidebar on mobile
      if (action.payload && state.sidebarOpen) {
        state.sidebarOpen = false;
      }
    },
    openDialog: (state, action: PayloadAction<{ dialog: keyof UIState['dialogOpen']; data?: any }>) => {
      state.dialogOpen[action.payload.dialog] = true;
      if (action.payload.data) {
        state.dialogData = action.payload.data;
      }
    },
    closeDialog: (state, action: PayloadAction<keyof UIState['dialogOpen']>) => {
      state.dialogOpen[action.payload] = false;
      state.dialogData = null;
    },
    closeAllDialogs: (state) => {
      Object.keys(state.dialogOpen).forEach(key => {
        state.dialogOpen[key as keyof UIState['dialogOpen']] = false;
      });
      state.dialogData = null;
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setCurrentView,
  setIsMobile,
  openDialog,
  closeDialog,
  closeAllDialogs,
} = uiSlice.actions;

// Export selectors
export const selectUI = (state: RootState) => state.ui;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectIsMobile = (state: RootState) => state.ui.isMobile;
export const selectDialogOpen = (state: RootState) => state.ui.dialogOpen;
export const selectDialogData = (state: RootState) => state.ui.dialogData;

// Export reducer
export default uiSlice.reducer;
