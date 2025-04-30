// appwrite-setup.js
// Fixed script to automate Appwrite setup for Book Manager app
const { Client, Databases, Storage, ID, Permission, Role } = require('node-appwrite');
const fs = require('fs');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Configuration object to store Appwrite details
const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '',
    apiKey: '',
    databaseId: '',
    bucketId: '',
    collectionIds: {},
};

// Function to get user input
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to save configuration to .env file
const saveEnvFile = () => {
    const envContent = `VITE_APPWRITE_ENDPOINT=${config.endpoint}
VITE_APPWRITE_PROJECT_ID=${config.projectId}
VITE_APPWRITE_DATABASE_ID=${config.databaseId}
VITE_APPWRITE_BOOKS_COLLECTION_ID=${config.collectionIds.books || ''}
VITE_APPWRITE_AUTHORS_COLLECTION_ID=${config.collectionIds.authors || ''}
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=${config.collectionIds.categories || ''}
VITE_APPWRITE_PUBLISHERS_COLLECTION_ID=${config.collectionIds.publishers || ''}
VITE_APPWRITE_LOANS_COLLECTION_ID=${config.collectionIds.loans || ''}
VITE_APPWRITE_STATISTICS_COLLECTION_ID=${config.collectionIds.statistics || ''}
VITE_APPWRITE_BUCKET_ID=${config.bucketId || ''}
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created successfully');
};

// Initialize Appwrite client
const initClient = () => {
    const client = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId)
        .setKey(config.apiKey);

    const databases = new Databases(client);
    const storage = new Storage(client);

    return { client, databases, storage };
};

// Set up database
const setupDatabase = async (databases) => {
    try {
        console.log('Creating database...');
        const database = await databases.create(
            ID.unique(),
            'book-manager-db'
        );

        config.databaseId = database.$id;
        console.log(`✅ Database created with ID: ${database.$id}`);
        return database;
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
};

// FIX: Updated attribute creation functions to not set default values

// Helper function to create string attribute with proper error handling
const createStringAttribute = async (databases, databaseId, collectionId, name, size, required, array = false) => {
    try {
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            name,
            size,
            required,
            undefined, // Default value set to undefined
            array
        );
        console.log(`  - Created string attribute: ${name}${array ? ' (array)' : ''}`);
    } catch (error) {
        console.error(`  - Error creating string attribute ${name}:`, error.message);
    }
};

// Helper function to create integer attribute with proper error handling
const createIntegerAttribute = async (databases, databaseId, collectionId, name, required) => {
    try {
        await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            name,       // key
            required,   // required
            null,       // min
            null,       // max
            0           // defaultValue (always 0)
        );
        console.log(`  - Created integer attribute: ${name}`);
    } catch (error) {
        console.error(`  - Error creating integer attribute ${name}:`, error.message);
    }
};

// Helper function to create boolean attribute with proper error handling
const createBooleanAttribute = async (databases, databaseId, collectionId, name, required) => {
    try {
        await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            name,
            required,
            undefined  // Default value set to undefined
        );
        console.log(`  - Created boolean attribute: ${name}`);
    } catch (error) {
        console.error(`  - Error creating boolean attribute ${name}:`, error.message);
    }
};

// Helper function to create date attribute with proper error handling
const createDateAttribute = async (databases, databaseId, collectionId, name, required) => {
    try {
        await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            name,
            required
        );
        console.log(`  - Created date attribute: ${name}`);
    } catch (error) {
        console.error(`  - Error creating date attribute ${name}:`, error.message);
    }
};

// Set up collections
const setupCollections = async (databases) => {
    const databaseId = config.databaseId;
    const collections = {};

    // Books Collection
    try {
        console.log('Creating books collection...');
        collections.books = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Books',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.collectionIds.books = collections.books.$id;

        // Add attributes for books collection
        await createStringAttribute(databases, databaseId, collections.books.$id, 'title', 255, true);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'author', 255, true);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'series', 255, false);
        await createIntegerAttribute(databases, databaseId, collections.books.$id, 'volumeInSeries', false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'part', 255, false);
        await createIntegerAttribute(databases, databaseId, collections.books.$id, 'totalVolumesInSeries', false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'classification', 255, false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'publisher', 255, false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'isbn', 255, false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'categories', 255, false, true);
        await createIntegerAttribute(databases, databaseId, collections.books.$id, 'publicationYear', false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'language', 100, false);
        await createIntegerAttribute(databases, databaseId, collections.books.$id, 'pageCount', false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'description', 4096, false); // Reduced size
        await createStringAttribute(databases, databaseId, collections.books.$id, 'coverImage', 2048, false); // Reduced size
        await createStringAttribute(databases, databaseId, collections.books.$id, 'location', 255, false);
        await createDateAttribute(databases, databaseId, collections.books.$id, 'acquisitionDate', false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'acquisitionMethod', 100, false);
        await createIntegerAttribute(databases, databaseId, collections.books.$id, 'rating', false);
        await createStringAttribute(databases, databaseId, collections.books.$id, 'notes', 4096, false); // Reduced size
        await createBooleanAttribute(databases, databaseId, collections.books.$id, 'isLoaned', false);
        await createDateAttribute(databases, databaseId, collections.books.$id, 'createdAt', false);
        await createDateAttribute(databases, databaseId, collections.books.$id, 'updatedAt', false);

        console.log(`✅ Books collection created with ID: ${collections.books.$id}`);
    } catch (error) {
        console.error('Error creating books collection:', error);
    }

    // Authors Collection
    try {
        console.log('Creating authors collection...');
        collections.authors = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Authors',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.collectionIds.authors = collections.authors.$id;

        // Add attributes for authors collection with birthDate and deathDate as proper dates
        await createStringAttribute(databases, databaseId, collections.authors.$id, 'name', 255, true);
        await createStringAttribute(databases, databaseId, collections.authors.$id, 'biography', 4096, false); // Reduced size
        await createDateAttribute(databases, databaseId, collections.authors.$id, 'birthDate', false);
        await createDateAttribute(databases, databaseId, collections.authors.$id, 'deathDate', false);
        await createStringAttribute(databases, databaseId, collections.authors.$id, 'nationality', 255, false);
        await createStringAttribute(databases, databaseId, collections.authors.$id, 'notes', 4096, false); // Reduced size

        console.log(`✅ Authors collection created with ID: ${collections.authors.$id}`);
    } catch (error) {
        console.error('Error creating authors collection:', error);
    }

    // Categories Collection
    try {
        console.log('Creating categories collection...');
        collections.categories = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Categories',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.collectionIds.categories = collections.categories.$id;

        // Add attributes for categories collection
        await createStringAttribute(databases, databaseId, collections.categories.$id, 'name', 255, true);
        await createStringAttribute(databases, databaseId, collections.categories.$id, 'description', 1000, false);
        await createStringAttribute(databases, databaseId, collections.categories.$id, 'color', 20, false);
        await createStringAttribute(databases, databaseId, collections.categories.$id, 'parent', 255, false);

        console.log(`✅ Categories collection created with ID: ${collections.categories.$id}`);
    } catch (error) {
        console.error('Error creating categories collection:', error);
    }

    // Publishers Collection
    try {
        console.log('Creating publishers collection...');
        collections.publishers = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Publishers',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.collectionIds.publishers = collections.publishers.$id;

        // Add attributes for publishers collection
        await createStringAttribute(databases, databaseId, collections.publishers.$id, 'name', 255, true);
        await createStringAttribute(databases, databaseId, collections.publishers.$id, 'location', 255, false);
        await createStringAttribute(databases, databaseId, collections.publishers.$id, 'website', 2048, false); // Reduced size
        await createStringAttribute(databases, databaseId, collections.publishers.$id, 'notes', 4096, false); // Reduced size

        console.log(`✅ Publishers collection created with ID: ${collections.publishers.$id}`);
    } catch (error) {
        console.error('Error creating publishers collection:', error);
    }

    // Loans Collection
    try {
        console.log('Creating loans collection...');
        collections.loans = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Loans',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.collectionIds.loans = collections.loans.$id;

        // Add attributes for loans collection with proper date fields
        await createStringAttribute(databases, databaseId, collections.loans.$id, 'bookId', 255, true);
        await createStringAttribute(databases, databaseId, collections.loans.$id, 'borrowerName', 255, true);
        await createStringAttribute(databases, databaseId, collections.loans.$id, 'borrowerContact', 255, false);
        await createDateAttribute(databases, databaseId, collections.loans.$id, 'loanDate', false);
        await createDateAttribute(databases, databaseId, collections.loans.$id, 'dueDate', false);
        await createDateAttribute(databases, databaseId, collections.loans.$id, 'returnDate', false);
        await createStringAttribute(databases, databaseId, collections.loans.$id, 'status', 50, false);
        await createStringAttribute(databases, databaseId, collections.loans.$id, 'notes', 4096, false); // Reduced size (consistency)

        console.log(`✅ Loans collection created with ID: ${collections.loans.$id}`);
    } catch (error) {
        console.error('Error creating loans collection:', error);
    }

    // Statistics Collection
    try {
        console.log('Creating statistics collection...');
        collections.statistics = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Statistics',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.collectionIds.statistics = collections.statistics.$id;

        // Add attributes for statistics collection
        await createStringAttribute(databases, databaseId, collections.statistics.$id, 'defaultLanguage', 50, false);
        await createIntegerAttribute(databases, databaseId, collections.statistics.$id, 'defaultLoanPeriod', false);
        await createBooleanAttribute(databases, databaseId, collections.statistics.$id, 'showNotifications', false);
        await createBooleanAttribute(databases, databaseId, collections.statistics.$id, 'autoBackup', false);
        await createIntegerAttribute(databases, databaseId, collections.statistics.$id, 'backupInterval', false);
        await createDateAttribute(databases, databaseId, collections.statistics.$id, 'lastSync', false);
        await createDateAttribute(databases, databaseId, collections.statistics.$id, 'updatedAt', false);

        console.log(`✅ Statistics collection created with ID: ${collections.statistics.$id}`);
    } catch (error) {
        console.error('Error creating statistics collection:', error);
    }

    return collections;
};

// Set up storage bucket for book covers
const setupStorage = async (storage) => {
    try {
        console.log('Creating storage bucket for book covers...');
        const bucket = await storage.createBucket(
            ID.unique(),
            'Book Covers',
            [Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin'))]
        );

        config.bucketId = bucket.$id;
        console.log(`✅ Storage bucket created with ID: ${bucket.$id}`);
        return bucket;
    } catch (error) {
        console.error('Error creating storage bucket:', error);
        throw error;
    }
};

// Sleep function to add delay between API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main setup function
const setup = async () => {
    try {
        // Get configuration from user
        config.projectId = await question('Enter your Appwrite Project ID: ');
        config.apiKey = await question('Enter your Appwrite API Key (with full access): ');

        // Initialize client
        const { client, databases, storage } = initClient();

        // Create database
        const database = await setupDatabase(databases);

        // Add a small delay to avoid rate limiting
        await sleep(1000);

        // Create collections
        const collections = await setupCollections(databases);

        // Add a small delay to avoid rate limiting
        await sleep(1000);

        // Create storage bucket
        const bucket = await setupStorage(storage);

        // Save configuration to .env file
        saveEnvFile();

        console.log('\n🎉 Setup complete! Your Appwrite backend is now ready for use with Book Manager.');
        console.log('\nTip: In the Appwrite console, you may want to manually set these defaults:');
        console.log(' - "Hebrew" for the language field');
        console.log(' - "active" for loan status');
        console.log(' - "#1890ff" for category colors');
        console.log(' - 14 for defaultLoanPeriod');
        console.log('\nNext steps:');
        console.log('1. Add platforms in your Appwrite console (localhost for development, GitHub Pages for production)');
        console.log('2. Add at least one user with admin role in Authentication settings');
        console.log('3. Update your frontend code to use the Appwrite services');

    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        rl.close();
    }
};

// Run the setup
setup();
