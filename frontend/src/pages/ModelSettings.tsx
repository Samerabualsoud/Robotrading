import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  useTheme
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectFeatures, 
  updateFeatureEnabled, 
  updateParameterValue,
  fetchModelConfigStart,
  fetchPerformanceStart
} from '../../store/slices/modelSlice';
import { addNotification } from '../../store/slices/uiSlice';
import ModelPerformanceCard from '../model/ModelPerformanceCard';

const ModelSettings: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const features = useSelector(selectFeatures);
  
  const handleFeatureToggle = (featureName: string, enabled: boolean) => {
    dispatch(updateFeatureEnabled({ featureName, enabled }));
  };
  
  const handleParameterChange = (featureName: string, parameterName: string, value: number | string | boolean) => {
    dispatch(updateParameterValue({ featureName, parameterName, value }));
  };
  
  const handleSaveChanges = () => {
    // In a real app, this would dispatch an action to save the changes to the backend
    dispatch(addNotification({
      type: 'success',
      message: 'Model settings saved successfully'
    }));
  };
  
  const handleResetDefaults = () => {
    // In a real app, this would dispatch an action to reset to defaults
    dispatch(fetchModelConfigStart());
    dispatch(addNotification({
      type: 'info',
      message: 'Model settings reset to defaults'
    }));
  };
  
  return (
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Model Settings
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleResetDefaults}
          >
            Reset Defaults
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        These settings control the behavior of the AI trading model. Changes will affect future trading decisions.
      </Alert>
      
      <Grid container spacing={3}>
        {/* Model Performance */}
        <Grid item xs={12}>
          <ModelPerformanceCard />
        </Grid>
        
        {/* Feature Settings */}
        {features.map((feature) => (
          <Grid item xs={12} key={feature.name}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                opacity: feature.enabled ? 1 : 0.7,
                transition: 'opacity 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{feature.name}</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={feature.enabled}
                      onChange={(e) => handleFeatureToggle(feature.name, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={feature.enabled ? "Enabled" : "Disabled"}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {feature.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                {feature.parameters.map((param) => (
                  <Grid item xs={12} md={6} lg={4} key={param.name}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" paragraph>
                        {param.description}
                      </Typography>
                      
                      {param.type === 'boolean' && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={param.value as boolean}
                              onChange={(e) => handleParameterChange(feature.name, param.name, e.target.checked)}
                              color="primary"
                              disabled={!feature.enabled}
                            />
                          }
                          label={param.value ? "Enabled" : "Disabled"}
                        />
                      )}
                      
                      {param.type === 'number' && (
                        <Box sx={{ px: 1 }}>
                          <Slider
                            value={param.value as number}
                            min={param.min || 0}
                            max={param.max || 100}
                            step={(param.max && param.min) ? (param.max - param.min) / 100 : 0.01}
                            onChange={(_, newValue) => handleParameterChange(feature.name, param.name, newValue as number)}
                            valueLabelDisplay="auto"
                            disabled={!feature.enabled}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              {param.min || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {param.max || 100}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      
                      {param.type === 'select' && (
                        <FormControl fullWidth size="small" disabled={!feature.enabled}>
                          <InputLabel id={`${param.name}-label`}>
                            {param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/([A-Z])/g, ' $1')}
                          </InputLabel>
                          <Select
                            labelId={`${param.name}-label`}
                            value={param.value as string}
                            label={param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/([A-Z])/g, ' $1')}
                            onChange={(e) => handleParameterChange(feature.name, param.name, e.target.value)}
                          >
                            {param.options?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      
                      {param.type === 'string' && (
                        <TextField
                          fullWidth
                          size="small"
                          value={param.value as string}
                          onChange={(e) => handleParameterChange(feature.name, param.name, e.target.value)}
                          disabled={!feature.enabled}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ModelSettings;
