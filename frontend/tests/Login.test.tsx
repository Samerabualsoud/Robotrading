import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Login from '../src/pages/Login';
import { login } from '../src/store/slices/authSlice';

// Mock Redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the login action
jest.mock('../src/store/slices/authSlice', () => ({
  login: jest.fn()
}));

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isLoading: false,
        error: null
      }
    });
    
    // Reset mock
    login.mockClear();
  });

  test('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if important elements are rendered
    expect(screen.getByText('Forex AI Trading Platform')).toBeInTheDocument();
    expect(screen.getByText('Login with your MetaTrader 5 account')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Type')).toBeInTheDocument();
    expect(screen.getByLabelText('MT5 Server')).toBeInTheDocument();
    expect(screen.getByLabelText('MT5 Login ID')).toBeInTheDocument();
    expect(screen.getByLabelText('MT5 Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login to mt5/i })).toBeInTheDocument();
  });

  test('handles form submission correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Account Type'), { target: { value: 'demo' } });
    
    // Select a server
    const serverSelect = screen.getByLabelText('MT5 Server');
    fireEvent.change(serverSelect, { target: { value: 'MetaQuotes-Demo' } });
    
    // Fill in login and password
    fireEvent.change(screen.getByLabelText('MT5 Login ID'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('MT5 Password'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login to mt5/i }));
    
    // Check if login action was dispatched with correct arguments
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        server: 'MetaQuotes-Demo',
        login: '12345678',
        password: 'password123'
      });
    });
  });

  test('displays error message when login fails', () => {
    store = mockStore({
      auth: {
        isLoading: false,
        error: 'Invalid credentials'
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if error message is displayed
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  test('disables login button when form is incomplete', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if button is disabled initially
    expect(screen.getByRole('button', { name: /login to mt5/i })).toBeDisabled();
    
    // Fill in some fields but not all
    fireEvent.change(screen.getByLabelText('MT5 Server'), { target: { value: 'MetaQuotes-Demo' } });
    fireEvent.change(screen.getByLabelText('MT5 Login ID'), { target: { value: '12345678' } });
    
    // Button should still be disabled
    expect(screen.getByRole('button', { name: /login to mt5/i })).toBeDisabled();
    
    // Fill in the last field
    fireEvent.change(screen.getByLabelText('MT5 Password'), { target: { value: 'password123' } });
    
    // Button should be enabled now
    expect(screen.getByRole('button', { name: /login to mt5/i })).not.toBeDisabled();
  });

  test('shows loading state during authentication', () => {
    store = mockStore({
      auth: {
        isLoading: true,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if loading indicator is shown
    expect(screen.getByRole('button', { name: /connecting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled();
  });
});
