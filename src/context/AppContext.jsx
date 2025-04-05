// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import gistService from '../services/gistService';

// Create context
const AppContext = createContext();

// Book model example
const createBookModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    title: data.title || '',
    author: data.author || '', // ID reference to authors collection
    publisher: data.publisher || '', // ID reference to publishers collection
    isbn: data.isbn || '',
    categories: data.categories || [], // Array of category IDs
    publicationYear: data.publicationYear || null,
    language: data.language || 'Hebrew',
    pageCount: data.pageCount || null,
    description: data.description || '',
    coverImage: data.coverImage || '',
    location: data.location || '',
    acquisitionDate: data.acquisitionDate || null,
    acquisitionMethod: data.acquisitionMethod || '',
    rating: data.rating || null,
    notes: data.notes || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
};

// Loan model example
const createLoanModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    bookId: data.bookId || '', // ID reference to books collection
    borrowerName: data.borrowerName || '',
    borrowerContact: data.borrowerContact || '',
    loanDate: data.loanDate || new Date().toISOString(),
    dueDate: data.dueDate || '',
    returnDate: data.returnDate || null, // Null when not returned
    status: data.status || 'active', // active, returned, overdue
    notes: data.notes || '',
  };
};

// Category model example
const createCategoryModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    name: data.name || '',
    description: data.description || '',
    color: data.color || '#1890ff',
    parent: data.parent || null, // For nested categories
  };
};

// Author model example
const createAuthorModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    name: data.name || '',
    biography: data.biography || '',
    birthYear: data.birthYear || null,
    deathYear: data.deathYear || null,
    nationality: data.nationality || '',
    notes: data.notes || '',
  };
};

// Publisher model example
const createPublisherModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    name: data.name || '',
    location: data.location || '',
    website: data.website || '',
    notes: data.notes || '',
  };
};

// The provider component
export const AppProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gistId, setGistId] = useState(null);
  const [theme, setTheme] = useState('light');

  // Data collections
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [statistics, setStatistics] = useState({});

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = gistService.isAuthenticated();
      setAuthenticated(isAuth);

      if (isAuth) {
        // Get gistId from session storage or find existing gist
        let storedGistId = sessionStorage.getItem('bookManagerGistId');

        if (!storedGistId) {
          try {
            storedGistId = await gistService.findOrCreateAppGist();
            sessionStorage.setItem('bookManagerGistId', storedGistId);
          } catch (err) {
            console.error('Failed to find or create gist:', err);
            gistService.removeToken();
            setAuthenticated(false);
          }
        }

        setGistId(storedGistId);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Load data if authenticated and gistId is available
  useEffect(() => {
    if (authenticated && gistId) {
      loadAllCollections();
    }
  }, [authenticated, gistId]);

  // Load all collections from the gist
  const loadAllCollections = async () => {
    setLoading(true);
    try {
      const [
        booksData,
        loansData,
        categoriesData,
        authorsData,
        publishersData,
        statisticsData,
      ] = await Promise.all([
        gistService.getCollection(gistId, 'books'),
        gistService.getCollection(gistId, 'loans'),
        gistService.getCollection(gistId, 'categories'),
        gistService.getCollection(gistId, 'authors'),
        gistService.getCollection(gistId, 'publishers'),
        gistService.getCollection(gistId, 'statistics'),
      ]);

      setBooks(booksData);
      setLoans(loansData);
      setCategories(categoriesData);
      setAuthors(authorsData);
      setPublishers(publishersData);
      setStatistics(statisticsData.length > 0 ? statisticsData[0] : {});
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save a specific collection
  const saveCollection = async (collectionName, data) => {
    if (!gistId) return;

    try {
      await gistService.updateCollection(gistId, collectionName, data);
      return true;
    } catch (err) {
      console.error(`Error saving ${collectionName}:`, err);
      return false;
    }
  };

  // CRUD operations for books
  const addBook = async (bookData) => {
    const newBook = createBookModel(bookData);
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    await saveCollection('books', updatedBooks);
    return newBook;
  };

  const updateBook = async (id, bookData) => {
    const updatedBooks = books.map((book) =>
      book.id === id
        ? { ...book, ...bookData, updatedAt: new Date().toISOString() }
        : book
    );
    setBooks(updatedBooks);
    await saveCollection('books', updatedBooks);
    return updatedBooks.find((book) => book.id === id);
  };

  const deleteBook = async (id) => {
    const updatedBooks = books.filter((book) => book.id !== id);
    setBooks(updatedBooks);
    await saveCollection('books', updatedBooks);
    return true;
  };

  // CRUD operations for loans
  const addLoan = async (loanData) => {
    const newLoan = createLoanModel(loanData);
    const updatedLoans = [...loans, newLoan];
    setLoans(updatedLoans);
    await saveCollection('loans', updatedLoans);
    return newLoan;
  };

  const updateLoan = async (id, loanData) => {
    const updatedLoans = loans.map((loan) =>
      loan.id === id ? { ...loan, ...loanData } : loan
    );
    setLoans(updatedLoans);
    await saveCollection('loans', updatedLoans);
    return updatedLoans.find((loan) => loan.id === id);
  };

  const deleteLoan = async (id) => {
    const updatedLoans = loans.filter((loan) => loan.id !== id);
    setLoans(updatedLoans);
    await saveCollection('loans', updatedLoans);
    return true;
  };

  // CRUD operations for categories
  const addCategory = async (categoryData) => {
    const newCategory = createCategoryModel(categoryData);
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await saveCollection('categories', updatedCategories);
    return newCategory;
  };

  const updateCategory = async (id, categoryData) => {
    const updatedCategories = categories.map((category) =>
      category.id === id ? { ...category, ...categoryData } : category
    );
    setCategories(updatedCategories);
    await saveCollection('categories', updatedCategories);
    return updatedCategories.find((category) => category.id === id);
  };

  const deleteCategory = async (id) => {
    const updatedCategories = categories.filter(
      (category) => category.id !== id
    );
    setCategories(updatedCategories);
    await saveCollection('categories', updatedCategories);
    return true;
  };

  // CRUD operations for authors
  const addAuthor = async (authorData) => {
    const newAuthor = createAuthorModel(authorData);
    const updatedAuthors = [...authors, newAuthor];
    setAuthors(updatedAuthors);
    await saveCollection('authors', updatedAuthors);
    return newAuthor;
  };

  const updateAuthor = async (id, authorData) => {
    const updatedAuthors = authors.map((author) =>
      author.id === id ? { ...author, ...authorData } : author
    );
    setAuthors(updatedAuthors);
    await saveCollection('authors', updatedAuthors);
    return updatedAuthors.find((author) => author.id === id);
  };

  const deleteAuthor = async (id) => {
    const updatedAuthors = authors.filter((author) => author.id !== id);
    setAuthors(updatedAuthors);
    await saveCollection('authors', updatedAuthors);
    return true;
  };

  // CRUD operations for publishers
  const addPublisher = async (publisherData) => {
    const newPublisher = createPublisherModel(publisherData);
    const updatedPublishers = [...publishers, newPublisher];
    setPublishers(updatedPublishers);
    await saveCollection('publishers', updatedPublishers);
    return newPublisher;
  };

  const updatePublisher = async (id, publisherData) => {
    const updatedPublishers = publishers.map((publisher) =>
      publisher.id === id ? { ...publisher, ...publisherData } : publisher
    );
    setPublishers(updatedPublishers);
    await saveCollection('publishers', updatedPublishers);
    return updatedPublishers.find((publisher) => publisher.id === id);
  };

  const deletePublisher = async (id) => {
    const updatedPublishers = publishers.filter(
      (publisher) => publisher.id !== id
    );
    setPublishers(updatedPublishers);
    await saveCollection('publishers', updatedPublishers);
    return true;
  };

  // Update statistics
  const updateStatistics = async (statsData) => {
    const updatedStats = {
      ...statistics,
      ...statsData,
      updatedAt: new Date().toISOString(),
    };
    setStatistics(updatedStats);
    await saveCollection('statistics', [updatedStats]);
    return updatedStats;
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    gistService.removeToken();
    sessionStorage.removeItem('bookManagerGistId');
    setAuthenticated(false);
    setGistId(null);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Context value
  const contextValue = {
    authenticated,
    loading,
    theme,
    books,
    loans,
    categories,
    authors,
    publishers,
    statistics,
    addBook,
    updateBook,
    deleteBook,
    addLoan,
    updateLoan,
    deleteLoan,
    addCategory,
    updateCategory,
    deleteCategory,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    addPublisher,
    updatePublisher,
    deletePublisher,
    updateStatistics,
    handleLoginSuccess,
    handleLogout,
    toggleTheme,
    refreshData: loadAllCollections,
    createBookModel,
    createLoanModel,
    createCategoryModel,
    createAuthorModel,
    createPublisherModel,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
};

export default AppContext;
