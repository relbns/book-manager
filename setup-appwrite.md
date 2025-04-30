# Appwrite Setup and Deployment Guide for Book Manager

This guide will walk you through setting up Appwrite as the backend for your Book Manager application. By following these steps, you'll create a secure, scalable backend that integrates with your existing GitHub Pages frontend.

## Prerequisites

- A GitHub account (for GitHub Pages deployment)
- An Appwrite account (free tier available at [cloud.appwrite.io](https://cloud.appwrite.io))
- Node.js and npm installed locally for development

## Step 1: Create an Appwrite Account and Project

1. Sign up for a free account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. After logging in, create a new project:
   - Click "Create Project"
   - Name your project (e.g., "Book Manager")
   - Select "Web App" as the platform
   - Enter your GitHub Pages domain (e.g., `yourusername.github.io`) to configure CORS (use * while developing)
   - Click "Create" to confirm

## Step 2: Set Up Authentication

1. In your Appwrite project dashboard, go to "Auth" in the left sidebar
2. Enable the "Email/Password" authentication method
3. (Optional) Configure additional authentication providers if desired

### Configure User Preferences

1. In the Auth settings, scroll down to "User Preferences"
2. Set your default user labels (we will use these for permission control)
3. Configure email settings for verification, password reset, etc.

## Step 3: Configure API Keys

1. Go to "API Keys" in the left sidebar
2. Create a new API key:
   - Name: "book-manager-frontend"
   - Scopes: Select the necessary permissions for your collections:
     - collections.read
     - documents.read
     - files.read
     - account.read
   - Click "Create"
3. Copy the generated API key - you'll need it in your frontend code

## Step 4: Create a Database and Collections
grab the projectId and the apikey and run `npm run setup:appwrite`, this will build all the appwrite following db structure, the storage configuration and will create your admin user.
it will also create the .env file with all of the env vars.

1. Go to "Databases" in the left sidebar
2. Create a new database:
   - Click "Create Database"
   - Name: "book-manager-db"
   - Click "Create"

Now, create the following collections:

### Books Collection

1. Click "Create Collection"
2. Name: "books"
3. Click "Create"
4. Go to the "Attributes" tab and add the following attributes:
   - `title` (string, required)
   - `author` (string, required) - will store author ID
   - `series` (string)
   - `volumeInSeries` (integer)
   - `part` (string)
   - `totalVolumesInSeries` (integer)
   - `classification` (string)
   - `publisher` (string) - will store publisher ID
   - `isbn` (string)
   - `categories` (string[]) - will store category IDs
   - `publicationYear` (integer)
   - `language` (string)
   - `pageCount` (integer)
   - `description` (string)
   - `coverImage` (string) - will store image URL
   - `location` (string)
   - `acquisitionDate` (string)
   - `acquisitionMethod` (string)
   - `rating` (integer)
   - `notes` (string)
   - `isLoaned` (boolean)
   - `createdAt` (string)
   - `updatedAt` (string)

5. Go to the "Settings" tab and set the permissions:
   - Add "Read" permission for "any" role
   - Add "Create", "Update", "Delete" permissions for "label:admin" role
   - In production, you may want to add a "team" role for more granular permissions

Repeat a similar process for the other collections:

### Authors Collection

- `name` (string, required)
- `biography` (string)
- `birthYear` (integer)
- `deathYear` (integer)
- `nationality` (string)
- `notes` (string)

### Categories Collection

- `name` (string, required)
- `description` (string)
- `color` (string) - Hex color code
- `parent` (string) - Parent category ID

### Publishers Collection

- `name` (string, required)
- `location` (string)
- `website` (string)
- `notes` (string)

### Loans Collection

- `bookId` (string, required)
- `borrowerName` (string, required)
- `borrowerContact` (string)
- `loanDate` (string)
- `dueDate` (string)
- `returnDate` (string)
- `status` (string)
- `notes` (string)

### Statistics Collection

- `defaultLanguage` (string)
- `defaultLoanPeriod` (integer)
- `showNotifications` (boolean)
- `autoBackup` (boolean)
- `backupInterval` (integer)
- `lastSync` (string)
- `updatedAt` (string)

For each collection, set the same permissions model:
- "Read" for "any" role
- "Create", "Update", "Delete" for "label:admin" role

## Step 4: Create a Storage Bucket for Book Covers

1. Go to "Storage" in the left sidebar
2. Click "Create Bucket"
3. Name: "book-covers"
4. Click "Create"
5. Go to the "Settings" tab and configure permissions:
   - Add "Read" permission for "any" role
   - Add "Create", "Update", "Delete" permissions for "label:admin" role

## Step 6: Set Up Environment Variables

Create a `.env` file in your project root (don't commit this to version control):

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_BOOKS_COLLECTION_ID=your-books-collection-id
VITE_APPWRITE_AUTHORS_COLLECTION_ID=your-authors-collection-id
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=your-categories-collection-id
VITE_APPWRITE_PUBLISHERS_COLLECTION_ID=your-publishers-collection-id
VITE_APPWRITE_LOANS_COLLECTION_ID=your-loans-collection-id
VITE_APPWRITE_STATISTICS_COLLECTION_ID=your-statistics-collection-id
VITE_APPWRITE_BUCKET_ID=your-bucket-id
```

Replace all placeholder values with the actual IDs from your Appwrite project.

## Step 7: Update Your Frontend Code

1. Install the Appwrite SDK:

```bash
npm install appwrite
```

2. Replace your existing GitHub Gist authentication with Appwrite authentication
3. Update your data service calls to use Appwrite
4. Ensure your CSV import/export functionalities are adapted to work with the new data structure

## Step 8: Create an Admin User

1. Go to "Auth" and then "Users" in your Appwrite dashboard
2. Click "Create User"
3. Fill in the details for your admin user
4. After creating the user, edit the user and add the "admin" label to give them administrative privileges

## Step 9: Deploy to GitHub Pages

1. Build your React application:

```bash
npm run build
```

2. Configure your GitHub Pages settings in your repository:
   - Go to Settings > Pages
   - Set the source to the branch and folder containing your build output
   - Save changes

3. Push your changes to GitHub to trigger the deployment

## Step 10: Data Migration

Follow these steps to migrate your existing data from GitHub Gist to Appwrite:

1. Export all your data from the old system using the CSV export functionality
2. Use the Import pages in your new Appwrite-based system to import the data
3. Follow the order mentioned in the CSV Import/Export Guide:
   - Authors first
   - Categories and publishers next
   - Books after that
   - Loans last

## Securing Your Application

### CORS Configuration

Ensure your GitHub Pages domain is properly configured in the Appwrite platform settings to prevent CORS issues.

### User Roles and Permissions

- The default permission setup gives read-only access to all authenticated users
- Admin users (with the "admin" label) have full CRUD permissions
- You can create more granular roles as needed by adding additional labels

### Invitation-Only Registration

To ensure only invited users can register:

1. In your Auth settings, you can disable public registrations
2. Use the UserInvitation component to create invitation links
3. Only users with invitation links can register

## Troubleshooting

### Authentication Issues

- Check that CORS is properly configured for your domain
- Ensure your API keys have the correct scopes
- Verify that your environment variables are correctly set

### Permission Errors

- Check the user's roles and labels
- Verify the permission settings for each collection
- Make sure the user is authenticated before attempting operations

### Data Import Issues

- For CSV import problems, check the encoding (should be UTF-8)
- Ensure references (like author IDs) exist before importing data that references them
- Verify that required fields are present in your import data

## Monitoring and Maintenance

### Monitoring Usage

1. In your Appwrite dashboard, go to "Overview" to see usage statistics
2. Monitor API usage to stay within your plan limits

### Backups

1. Use the export functionality in your app to regularly back up your data as CSV files
2. For larger databases, consider creating a scheduled backup script

## Advanced Features

### Custom Server Functions

For more complex operations, you can create Appwrite Functions:

1. Go to "Functions" in the Appwrite dashboard
2. Create a new function for operations like:
   - Bulk imports/exports
   - Complex queries
   - Data transformations
   - Sending email notifications

### WebSockets for Real-Time Updates

For multi-user scenarios, you can implement real-time updates:

1. Use Appwrite's real-time API to subscribe to document changes
2. Update your UI in response to changes made by other users

## Conclusion

By following this guide, you've set up a secure, scalable backend for your Book Manager using Appwrite. This allows you to maintain your existing user interface while gaining the benefits of a proper backend service with authentication, database, and file storage capabilities.

Remember to:
- Regularly back up your data
- Monitor your usage statistics
- Update your application dependencies
- Test thoroughly when making changes

For more information, refer to the [Appwrite documentation](https://appwrite.io/docs).