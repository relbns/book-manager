// src/services/appwriteService.js
import { Client, Account, Databases, Storage, Query, ID, Permission, Role } from 'appwrite';
import Papa from 'papaparse'; // <-- Add static import

// Initialize Appwrite Client
const client = new Client();

// Appwrite Configuration - Replace with your actual endpoints and project ID
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_BOOKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BOOKS_COLLECTION_ID;
const APPWRITE_AUTHORS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_AUTHORS_COLLECTION_ID;
const APPWRITE_CATEGORIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID;
const APPWRITE_PUBLISHERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PUBLISHERS_COLLECTION_ID;
const APPWRITE_LOANS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_LOANS_COLLECTION_ID;
const APPWRITE_STATISTICS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_STATISTICS_COLLECTION_ID;
const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

// Set up Appwrite client
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Helper function to check if user is admin
const isUserAdmin = async () => {
  try {
    const user = await account.get();
    return user.labels && user.labels.includes('admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// User & Authentication Service
const AuthService = {
  // Create a new account
  createAccount: async (email, password, name) => {
    try {
      const response = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      if (response.$id) {
        // Login immediately after account creation
        await AuthService.login(email, password);
        return response;
      }
    } catch (error) {
      console.error('Appwrite create account error:', error);
      throw error;
    }
  },

  // Login to the account
  login: async (email, password) => {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('Appwrite login error:', error);
      throw error;
    }
  },

  // Logout from the current session
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite logout error:', error);
      throw error;
    }
  },

  // Get current logged-in user
  getCurrentUser: async () => {
    try {
      const user = await account.get();
      // Determine user role
      user.isAdmin = user.labels && user.labels.includes('admin');
      return user;
    } catch (error) {
      console.error('Appwrite get current user error:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const user = await account.get();
      return !!user.$id;
    } catch (error) {
      return false;
    }
  },

  // Invite a user (admin only)
  inviteUser: async (email, isAdmin = false) => {
    try {
      // This would normally use a server function, but for simplicity:
      // 1. Create a URL for registration
      // 2. Send it via email (would be handled by a server function)

      // For now, just return the invitation URL that you would manually send
      const inviteUrl = `${window.location.origin}/register?email=${encodeURIComponent(email)}&invited=true${isAdmin ? '&role=admin' : ''}`;

      console.log('Invitation URL created:', inviteUrl);
      return inviteUrl;

      // In a real implementation, you would:
      // 1. Call a server function to create a user or send an invitation
      // 2. The server function would handle setting proper permissions and roles
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }
};

// Books Collection Service
const BookService = {
  // Get all books
  getBooks: async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_BOOKS_COLLECTION_ID,
        [Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite get books error:', error);
      throw error;
    }
  },

  // Get a single book by ID
  getBook: async (id) => {
    try {
      return await databases.getDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_BOOKS_COLLECTION_ID,
        id
      );
    } catch (error) {
      console.error('Appwrite get book error:', error);
      throw error;
    }
  },

  // Create a new book
  createBook: async (bookData) => {
    try {
      const { id, ...data } = bookData;

      const documentId = id || ID.unique();
      const isAdmin = await isUserAdmin();

      // Set permissions
      const permissions = [
        Permission.read(Role.any()), // All authenticated users can read
      ];

      if (isAdmin) {
        permissions.push(
          Permission.update(Role.label('admin')),
          Permission.delete(Role.label('admin'))
        );
      }

      // Format dates if needed
      if (data.acquisitionDate) {
        // Ensure acquisitionDate is stored as ISO string
        data.acquisitionDate = new Date(data.acquisitionDate).toISOString();
      }

      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_BOOKS_COLLECTION_ID,
        documentId,
        data,
        permissions
      );
    } catch (error) {
      console.error('Appwrite create book error:', error);
      throw error;
    }
  },

  // Update an existing book
  updateBook: async (id, bookData) => {
    try {
      // Remove id from the data to be updated
      const { id: _, ...data } = bookData;

      // Format dates if needed
      if (data.acquisitionDate) {
        // Ensure acquisitionDate is stored as ISO string
        data.acquisitionDate = new Date(data.acquisitionDate).toISOString();
      }

      // Include updatedAt timestamp
      data.updatedAt = new Date().toISOString();

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_BOOKS_COLLECTION_ID,
        id,
        data
      );
    } catch (error) {
      console.error('Appwrite update book error:', error);
      throw error;
    }
  },

  // Delete a book
  deleteBook: async (id) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_BOOKS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Appwrite delete book error:', error);
      throw error;
    }
  },

  // Upload a book cover image
  uploadCoverImage: async (file) => {
    try {
      const result = await storage.createFile(
        APPWRITE_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get the file view URL
      const fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, result.$id);
      return { id: result.$id, url: fileUrl };
    } catch (error) {
      console.error('Appwrite upload cover image error:', error);
      throw error;
    }
  }
};

// Authors Collection Service
const AuthorService = {
  // Get all authors
  getAuthors: async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_AUTHORS_COLLECTION_ID,
        [Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite get authors error:', error);
      throw error;
    }
  },

  // Get a single author
  getAuthor: async (id) => {
    try {
      return await databases.getDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_AUTHORS_COLLECTION_ID,
        id
      );
    } catch (error) {
      console.error('Appwrite get author error:', error);
      throw error;
    }
  },

  // Create a new author
  createAuthor: async (authorData) => {
    try {
      const { id, ...data } = authorData;

      const documentId = id || ID.unique();
      const isAdmin = await isUserAdmin();

      // Set permissions
      const permissions = [
        Permission.read(Role.any()), // All authenticated users can read
      ];

      if (isAdmin) {
        permissions.push(
          Permission.update(Role.label('admin')),
          Permission.delete(Role.label('admin'))
        );
      }

      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_AUTHORS_COLLECTION_ID,
        documentId,
        data,
        permissions
      );
    } catch (error) {
      console.error('Appwrite create author error:', error);
      throw error;
    }
  },

  // Update an existing author
  updateAuthor: async (id, authorData) => {
    try {
      // Remove id from the data to be updated
      const { id: _, ...data } = authorData;

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_AUTHORS_COLLECTION_ID,
        id,
        data
      );
    } catch (error) {
      console.error('Appwrite update author error:', error);
      throw error;
    }
  },

  // Delete an author
  deleteAuthor: async (id) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_AUTHORS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Appwrite delete author error:', error);
      throw error;
    }
  }
};

// Categories Collection Service
const CategoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_CATEGORIES_COLLECTION_ID,
        [Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite get categories error:', error);
      throw error;
    }
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const { id, ...data } = categoryData;

      const documentId = id || ID.unique();
      const isAdmin = await isUserAdmin();

      // Set permissions
      const permissions = [
        Permission.read(Role.any()), // All authenticated users can read
      ];

      if (isAdmin) {
        permissions.push(
          Permission.update(Role.label('admin')),
          Permission.delete(Role.label('admin'))
        );
      }

      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_CATEGORIES_COLLECTION_ID,
        documentId,
        data,
        permissions
      );
    } catch (error) {
      console.error('Appwrite create category error:', error);
      throw error;
    }
  },

  // Update an existing category
  updateCategory: async (id, categoryData) => {
    try {
      // Remove id from the data to be updated
      const { id: _, ...data } = categoryData;

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_CATEGORIES_COLLECTION_ID,
        id,
        data
      );
    } catch (error) {
      console.error('Appwrite update category error:', error);
      throw error;
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_CATEGORIES_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Appwrite delete category error:', error);
      throw error;
    }
  }
};

// Publishers Collection Service
const PublisherService = {
  // Get all publishers
  getPublishers: async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_PUBLISHERS_COLLECTION_ID,
        [Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite get publishers error:', error);
      throw error;
    }
  },

  // Create a new publisher
  createPublisher: async (publisherData) => {
    try {
      const { id, ...data } = publisherData;

      const documentId = id || ID.unique();
      const isAdmin = await isUserAdmin();

      // Set permissions
      const permissions = [
        Permission.read(Role.any()), // All authenticated users can read
      ];

      if (isAdmin) {
        permissions.push(
          Permission.update(Role.label('admin')),
          Permission.delete(Role.label('admin'))
        );
      }

      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PUBLISHERS_COLLECTION_ID,
        documentId,
        data,
        permissions
      );
    } catch (error) {
      console.error('Appwrite create publisher error:', error);
      throw error;
    }
  },

  // Update an existing publisher
  updatePublisher: async (id, publisherData) => {
    try {
      // Remove id from the data to be updated
      const { id: _, ...data } = publisherData;

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PUBLISHERS_COLLECTION_ID,
        id,
        data
      );
    } catch (error) {
      console.error('Appwrite update publisher error:', error);
      throw error;
    }
  },

  // Delete a publisher
  deletePublisher: async (id) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PUBLISHERS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Appwrite delete publisher error:', error);
      throw error;
    }
  }
};

// Loans Collection Service
const LoanService = {
  // Get all loans
  getLoans: async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_LOANS_COLLECTION_ID,
        [Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite get loans error:', error);
      throw error;
    }
  },

  // Create a new loan
  createLoan: async (loanData) => {
    try {
      const { id, ...data } = loanData;

      const documentId = id || ID.unique();
      const isAdmin = await isUserAdmin();

      // Set permissions
      const permissions = [
        Permission.read(Role.any()), // All authenticated users can read
      ];

      if (isAdmin) {
        permissions.push(
          Permission.update(Role.label('admin')),
          Permission.delete(Role.label('admin'))
        );
      }

      // Format dates
      if (data.loanDate) {
        data.loanDate = new Date(data.loanDate).toISOString();
      }

      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate).toISOString();
      }

      if (data.returnDate) {
        data.returnDate = new Date(data.returnDate).toISOString();
      }

      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LOANS_COLLECTION_ID,
        documentId,
        data,
        permissions
      );
    } catch (error) {
      console.error('Appwrite create loan error:', error);
      throw error;
    }
  },

  // Update an existing loan
  updateLoan: async (id, loanData) => {
    try {
      // Remove id from the data to be updated
      const { id: _, ...data } = loanData;

      // Format dates
      if (data.loanDate) {
        data.loanDate = new Date(data.loanDate).toISOString();
      }

      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate).toISOString();
      }

      if (data.returnDate) {
        data.returnDate = new Date(data.returnDate).toISOString();
      }

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LOANS_COLLECTION_ID,
        id,
        data
      );
    } catch (error) {
      console.error('Appwrite update loan error:', error);
      throw error;
    }
  },

  // Delete a loan
  deleteLoan: async (id) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_LOANS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Appwrite delete loan error:', error);
      throw error;
    }
  }
};

// Statistics Collection Service
const StatisticsService = {
  // Get statistics
  getStatistics: async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_STATISTICS_COLLECTION_ID,
        [Query.limit(1)]
      );

      if (response.documents.length > 0) {
        return response.documents[0];
      }

      // Create a default statistics document if none exists
      return await StatisticsService.createDefaultStatistics();
    } catch (error) {
      console.error('Appwrite get statistics error:', error);
      throw error;
    }
  },

  // Create default statistics
  createDefaultStatistics: async () => {
    try {
      const defaultStats = {
        defaultLanguage: 'Hebrew',
        showNotifications: true,
        autoBackup: true,
        lastSync: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const isAdmin = await isUserAdmin();

      // Set permissions
      const permissions = [
        Permission.read(Role.any()), // All authenticated users can read
      ];

      if (isAdmin) {
        permissions.push(
          Permission.update(Role.label('admin')),
          Permission.delete(Role.label('admin'))
        );
      }

      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_STATISTICS_COLLECTION_ID,
        ID.unique(),
        defaultStats,
        permissions
      );
    } catch (error) {
      console.error('Appwrite create statistics error:', error);
      throw error;
    }
  },

  // Update statistics
  updateStatistics: async (statisticsData) => {
    try {
      // Get current statistics
      const currentStats = await StatisticsService.getStatistics();

      // Update with new data
      statisticsData.updatedAt = new Date().toISOString();

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_STATISTICS_COLLECTION_ID,
        currentStats.$id,
        statisticsData
      );
    } catch (error) {
      console.error('Appwrite update statistics error:', error);
      throw error;
    }
  }
};

// CSV Import/Export Service
const CsvService = {
  // Import data from CSV
  importFromCsv: async (file, importType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const csvText = e.target.result;

          // Use statically imported PapaParse
          Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
            complete: (results) => {
              // Resolve with parsed data only, actual import happens in handleImport
              resolve(results.data);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  },

  // Process and import books
  importBooks: async (booksData) => {
    for (const bookData of booksData) {
      try {
        const authorName = bookData['מחבר']?.trim() || bookData.author?.trim();
        let authorId = null;

        if (authorName) {
          // Check if author exists
          try {
            const existingAuthors = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              APPWRITE_AUTHORS_COLLECTION_ID,
              [Query.equal('name', authorName), Query.limit(1)]
            );

            if (existingAuthors.total > 0) {
              authorId = existingAuthors.documents[0].$id;
            } else {
              // Author doesn't exist, create them
              console.log(`Creating new author: ${authorName}`);
              const newAuthor = await AuthorService.createAuthor({ name: authorName });
              authorId = newAuthor.$id;
            }
          } catch (authorError) {
            console.error(`Error finding or creating author "${authorName}":`, authorError);
            // Decide how to handle: skip book, assign null, etc.
            // For now, we'll skip assigning an author if there's an error.
          }
        }

        // Convert fields to match the schema
        const processedBook = {
          id: bookData.ID || ID.unique(),
          title: bookData['שם הספר'] || bookData.title || '',
          author: authorId, // Use the found or created author ID
          series: bookData['סדרה'] || bookData.series || '',
          volumeInSeries: bookData['כרך בסדרה'] || bookData.volumeInSeries || null,
          part: bookData['חלק'] || bookData.part || '',
          totalVolumesInSeries: bookData['סך כרכים בסדרה'] || bookData.totalVolumesInSeries || null,
          classification: bookData['סיווג'] || bookData.classification || '',
          publisher: bookData['הוצאה לאור'] || bookData.publisher || '',
          isbn: bookData['מק"ט'] || bookData.isbn || '',
          publicationYear: bookData['שנת הוצאה'] || bookData.publicationYear || null,
          language: bookData['שפה'] || bookData.language || 'Hebrew',
          pageCount: bookData['מספר עמודים'] || bookData.pageCount || null,
          notes: bookData['הערות'] || bookData.notes || '',
          isLoaned: bookData['הושאל'] === 'כן' || bookData.isLoaned || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Create the book
        await BookService.createBook(processedBook);
      } catch (error) {
        console.error(`Error importing book: ${error.message}`, bookData);
        // Continue with the next book
      }
    }
  },

  // Process and import authors
  importAuthors: async (authorsData) => {
    for (const authorData of authorsData) {
      try {
        const processedAuthor = {
          id: authorData.ID || authorData.id || ID.unique(),
          name: authorData.name || '',
          biography: authorData.biography || '',
          birthYear: authorData.birthYear || null,
          deathYear: authorData.deathYear || null,
          nationality: authorData.nationality || '',
          notes: authorData.notes || '',
        };

        await AuthorService.createAuthor(processedAuthor);
      } catch (error) {
        console.error(`Error importing author: ${error.message}`, authorData);
        // Continue with the next author
      }
    }
  },

  // Process and import categories
  importCategories: async (categoriesData) => {
    for (const categoryData of categoriesData) {
      try {
        const processedCategory = {
          id: categoryData.ID || categoryData.id || ID.unique(),
          name: categoryData.name || '',
          description: categoryData.description || '',
          color: categoryData.color || '#1890ff',
          parent: categoryData.parent || null,
        };

        await CategoryService.createCategory(processedCategory);
      } catch (error) {
        console.error(`Error importing category: ${error.message}`, categoryData);
        // Continue with the next category
      }
    }
  },

  // Process and import publishers
  importPublishers: async (publishersData) => {
    for (const publisherData of publishersData) {
      try {
        const processedPublisher = {
          id: publisherData.ID || publisherData.id || ID.unique(),
          name: publisherData.name || '',
          location: publisherData.location || '',
          website: publisherData.website || '',
          notes: publisherData.notes || '',
        };

        await PublisherService.createPublisher(processedPublisher);
      } catch (error) {
        console.error(`Error importing publisher: ${error.message}`, publisherData);
        // Continue with the next publisher
      }
    }
  },

  // Process and import loans
  importLoans: async (loansData) => {
    for (const loanData of loansData) {
      try {
        const processedLoan = {
          id: loanData.ID || loanData.id || ID.unique(),
          bookId: loanData.bookId || '',
          borrowerName: loanData.borrowerName || '',
          borrowerContact: loanData.borrowerContact || '',
          loanDate: loanData.loanDate ? new Date(loanData.loanDate).toISOString() : new Date().toISOString(),
          dueDate: loanData.dueDate ? new Date(loanData.dueDate).toISOString() : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          returnDate: loanData.returnDate ? new Date(loanData.returnDate).toISOString() : null,
          status: loanData.status || 'active',
          notes: loanData.notes || '',
        };

        await LoanService.createLoan(processedLoan);
      } catch (error) {
        console.error(`Error importing loan: ${error.message}`, loanData);
        // Continue with the next loan
      }
    }
  },

  // Export data to CSV
  exportToCsv: async (data, fileName, exportType) => {
    try {
      // Process data based on export type if needed
      let processedData = data;

      if (exportType === 'books') {
        processedData = data.map(book => ({
          'ID': book.$id || book.id,
          'שם הספר': book.title,
          'מחבר': book.author,
          'סדרה': book.series || '',
          'כרך בסדרה': book.volumeInSeries || '',
          'חלק': book.part || '',
          'סך כרכים בסדרה': book.totalVolumesInSeries || '',
          'סיווג': book.classification || '',
          'הערות': book.notes || '',
          'הושאל': book.isLoaned ? 'כן' : 'לא',
          'הוצאה לאור': book.publisher || '',
          'מק"ט': book.isbn || '',
          'שנת הוצאה': book.publicationYear || '',
          'שפה': book.language || '',
          'מספר עמודים': book.pageCount || '',
          'מיקום': book.location || '',
          'תאריך רכישה': book.acquisitionDate || '',
          'דירוג': book.rating || '',
        }));
      }

      // Use statically imported PapaParse
      // Convert to CSV
      const csv = Papa.unparse(processedData, {
        quotes: true,
        delimiter: ",",
        header: true
      });

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  },

  // Export data to JSON
  exportToJson: async (data, fileName) => {
    try {
      // Convert to JSON string with pretty formatting
      const json = JSON.stringify(data, null, 2);

      // Create download link
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  }
};

// Export all services
export {
  AuthService,
  BookService,
  AuthorService,
  CategoryService,
  PublisherService,
  LoanService,
  StatisticsService,
  CsvService
};
