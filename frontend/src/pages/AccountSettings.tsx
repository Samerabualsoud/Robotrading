import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Chip,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';

const AccountSettings: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const [editMode, setEditMode] = React.useState(false);
  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  
  const handleSaveProfile = () => {
    if (user) {
      dispatch(updateUser({
        ...user,
        name,
        email
      }));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully'
      }));
      
      setEditMode(false);
    }
  };
  
  const handleCancelEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setEditMode(false);
  };
  
  const handleRefreshConnection = (accountNumber: string) => {
    // In a real app, this would dispatch an action to refresh the connection
    dispatch(addNotification({
      type: 'info',
      message: `Refreshing connection to account ${accountNumber}`
    }));
  };
  
  const handleRemoveAccount = (accountNumber: string) => {
    // In a real app, this would dispatch an action to remove the account
    dispatch(addNotification({
      type: 'warning',
      message: `Removed account ${accountNumber}`
    }));
  };
  
  const handleAddAccount = () => {
    // In a real app, this would open a dialog to add a new account
    dispatch(addNotification({
      type: 'info',
      message: 'Add account functionality would open a dialog here'
    }));
  };
  
  return (
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Account Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Profile */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">User Profile</Typography>
              {!editMode ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {editMode ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {user?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {user?.email}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* MT5/MT4 Accounts */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">MT5/MT4 Accounts</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAccount}
              >
                Add Account
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {user?.mtAccounts && user.mtAccounts.length > 0 ? (
              <List>
                {user.mtAccounts.map((account) => (
                  <ListItem
                    key={account.accountNumber}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {account.accountNumber}
                          <Chip 
                            label={account.accountType} 
                            size="small" 
                            color={account.accountType === 'Demo' ? 'info' : 'success'}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            Broker: {account.broker}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span">
                            Server: {account.server}
                          </Typography>
                          <br />
                          <Typography variant="caption" component="span" color="text.secondary">
                            Last connected: {new Date(account.lastConnected).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="refresh"
                        onClick={() => handleRefreshConnection(account.accountNumber)}
                        sx={{ mr: 1 }}
                      >
                        <RefreshIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemoveAccount(account.accountNumber)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No MetaTrader accounts connected. Click "Add Account" to connect a new account.
              </Alert>
            )}
          </Paper>
        </Grid>
        
        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Your MetaTrader credentials are securely handled and never stored on our servers. 
              We use encrypted connections to communicate with MetaTrader servers.
            </Alert>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                dispatch(addNotification({
                  type: 'info',
                  message: 'Password change functionality would be implemented here'
                }));
              }}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountSettings;
