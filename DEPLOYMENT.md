# Forex AI Trading Platform Deployment Guide

This document provides instructions for deploying the Forex AI Trading Platform to Digital Ocean App Platform.

## Prerequisites

- Digital Ocean account
- GitHub repository with the Forex AI Trading Platform code
- MongoDB Atlas account (optional, for production database)

## Deployment Options

We've provided multiple deployment configurations to ensure compatibility with Digital Ocean App Platform:

### Option 1: Digital Ocean App Platform with Static Site + API

This is the recommended approach using the `.do/app.yaml` configuration file.

1. Fork or clone the repository to your GitHub account
2. Log in to your Digital Ocean account
3. Go to the App Platform section
4. Click "Create App"
5. Connect your GitHub repository
6. Select the repository and branch
7. Digital Ocean will automatically detect the `.do/app.yaml` configuration
8. Configure environment variables:
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `MONGODB_URI`: Your MongoDB connection string
9. Click "Create Resources"

### Option 2: Express Server Deployment

If Option 1 encounters routing issues, use this approach:

1. Fork or clone the repository to your GitHub account
2. Log in to your Digital Ocean account
3. Go to the App Platform section
4. Click "Create App"
5. Connect your GitHub repository
6. Select the repository and branch
7. Select "Web Service" as the component type
8. Set the following configuration:
   - Source Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - HTTP Port: 3000
9. Add environment variables as needed
10. Click "Create Resources"

## Troubleshooting Deployment Issues

### Blank Page After Deployment

If you encounter a blank page after deployment, try these solutions:

1. Check browser console for errors
2. Verify that the routes are configured correctly
3. Try the Express server deployment option
4. Ensure all environment variables are set correctly
5. Check that the build process completed successfully

### API Connection Issues

If the frontend cannot connect to the API:

1. Verify the `REACT_APP_API_URL` environment variable is set correctly
2. Check CORS configuration in the backend
3. Ensure the API service is running
4. Check network requests in browser developer tools

## Monitoring and Logs

After deployment:

1. Monitor application performance in the Digital Ocean dashboard
2. Check logs for any errors or warnings
3. Set up alerts for critical issues

## Scaling

To handle increased traffic:

1. Increase the instance count in the Digital Ocean dashboard
2. Scale the database as needed
3. Consider adding a caching layer for frequently accessed data

## Backup and Recovery

1. Set up regular database backups
2. Configure automatic deployments for code changes
3. Document recovery procedures for potential failures
