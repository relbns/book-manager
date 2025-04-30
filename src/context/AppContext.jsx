// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import {
  AuthService,
  BookService,
  AuthorService,
  CategoryService,
  PublisherService,
  LoanService,
  StatisticsService,
} from '../services/appwriteService';

// Create context
const AppContext = createContext();

// Book model example
const createBookModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    title: data.title || '',
    author: data.author || '',
    series: data.series || '',
    volumeInSeries: data.volumeInSeries || null,
    part: data.part || '',
    totalVolumesInSeries: data.totalVolumesInSeries || null,
    classification: data.classification || '',
    publisher: data.publisher || '',
    isbn: data.isbn || '',
    categories: data.categories || [],
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
    isLoaned: data.isLoaned || false,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
};

// Loan model example
const createLoanModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    bookId: data.bookId || '',
    borrowerName: data.borrowerName || '',
    borrowerContact: data.borrowerContact || '',
    loanDate: data.loanDate ? dayjs(data.loanDate) : dayjs(),
    dueDate: data.dueDate ? dayjs(data.dueDate) : dayjs().add(14, 'day'),
    returnDate: data.returnDate ? dayjs(data.returnDate) : null,
    status: data.status || 'active',
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
    parent: data.parent || null,
  };
};

// Author model example
const createAuthorModel = (data = {}) => {
  return {
    id: data.id || Date.now().toString(),
    name: data.name || '',
    biography: data.biography || '',
    birthDate: data.birthDate || null, // Changed from birthYear
    deathDate: data.deathDate || null, // Changed from deathYear
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
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isAdmin, setIsAdmin] = useState(false);

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
      try {
        const isAuth = await AuthService.isAuthenticated();
        setAuthenticated(isAuth);

        if (isAuth) {
          // Get current user
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          setIsAdmin(currentUser?.isAdmin || false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load data if authenticated
  useEffect(() => {
    if (authenticated) {
      loadAllCollections();
    }
  }, [authenticated]);

  // Load all collections from Appwrite
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
        BookService.getBooks(),
        LoanService.getLoans(),
        CategoryService.getCategories(),
        AuthorService.getAuthors(),
        PublisherService.getPublishers(),
        StatisticsService.getStatistics(),
      ]);

      setBooks(booksData);
      setLoans(loansData);
      setCategories(categoriesData);
      setAuthors(authorsData);
      setPublishers(publishersData);
      setStatistics(statisticsData || {});
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for books
  const addBook = async (bookData) => {
    const newBook = createBookModel(bookData);
    try {
      const response = await BookService.createBook(newBook);
      const updatedBooks = [...books, response];
      setBooks(updatedBooks);
      return response;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      const response = await BookService.updateBook(id, {
        ...bookData,
        updatedAt: new Date().toISOString(),
      });

      const updatedBooks = books.map((book) =>
        book.id === id || book.$id === id ? response : book
      );

      setBooks(updatedBooks);
      return response;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (id) => {
    try {
      await BookService.deleteBook(id);
      const updatedBooks = books.filter(
        (book) => book.id !== id && book.$id !== id
      );
      setBooks(updatedBooks);
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  // CRUD operations for loans
  const addLoan = async (loanData) => {
    const newLoan = createLoanModel(loanData);
    try {
      // Convert dayjs objects to ISO strings for storage
      const loanForStorage = {
        ...newLoan,
        loanDate: newLoan.loanDate.toISOString(),
        dueDate: newLoan.dueDate.toISOString(),
        returnDate: newLoan.returnDate
          ? newLoan.returnDate.toISOString()
          : null,
      };

      const response = await LoanService.createLoan(loanForStorage);

      // If the loan was created successfully, update the book's isLoaned status
      if (response) {
        const book = books.find(
          (b) => b.id === newLoan.bookId || b.$id === newLoan.bookId
        );
        if (book) {
          await updateBook(book.id || book.$id, {
            ...book,
            isLoaned: true,
          });
        }
      }

      // Convert back to dayjs for the UI
      const displayLoan = {
        ...response,
        loanDate: dayjs(response.loanDate),
        dueDate: dayjs(response.dueDate),
        returnDate: response.returnDate ? dayjs(response.returnDate) : null,
      };

      const updatedLoans = [...loans, displayLoan];
      setLoans(updatedLoans);
      return displayLoan;
    } catch (error) {
      console.error('Error adding loan:', error);
      throw error;
    }
  };

  const updateLoan = async (id, loanData) => {
    try {
      // Convert dayjs objects to ISO strings for storage
      const loanForStorage = {
        ...loanData,
        loanDate: loanData.loanDate
          ? typeof loanData.loanDate === 'object'
            ? loanData.loanDate.toISOString()
            : loanData.loanDate
          : null,
        dueDate: loanData.dueDate
          ? typeof loanData.dueDate === 'object'
            ? loanData.dueDate.toISOString()
            : loanData.dueDate
          : null,
        returnDate: loanData.returnDate
          ? typeof loanData.returnDate === 'object'
            ? loanData.returnDate.toISOString()
            : loanData.returnDate
          : null,
      };

      const response = await LoanService.updateLoan(id, loanForStorage);

      // If status changed to 'returned', update the book's isLoaned status
      if (loanData.status === 'returned' && response) {
        const loan = loans.find((l) => l.id === id || l.$id === id);
        if (loan) {
          const book = books.find(
            (b) => b.id === loan.bookId || b.$id === loan.bookId
          );
          if (book) {
            await updateBook(book.id || book.$id, {
              ...book,
              isLoaned: false,
            });
          }
        }
      }

      // Convert back to dayjs for the UI
      const displayLoan = {
        ...response,
        loanDate: dayjs(response.loanDate),
        dueDate: dayjs(response.dueDate),
        returnDate: response.returnDate ? dayjs(response.returnDate) : null,
      };

      const updatedLoans = loans.map((loan) =>
        loan.id === id || loan.$id === id ? displayLoan : loan
      );

      setLoans(updatedLoans);
      return displayLoan;
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    }
  };

  const deleteLoan = async (id) => {
    try {
      // Find the loan to get the bookId before deletion
      const loan = loans.find((l) => l.id === id || l.$id === id);

      await LoanService.deleteLoan(id);

      // If the loan was active, update the book's isLoaned status
      if (loan && loan.status === 'active') {
        const book = books.find(
          (b) => b.id === loan.bookId || b.$id === loan.bookId
        );
        if (book) {
          await updateBook(book.id || book.$id, {
            ...book,
            isLoaned: false,
          });
        }
      }

      const updatedLoans = loans.filter(
        (loan) => loan.id !== id && loan.$id !== id
      );
      setLoans(updatedLoans);
      return true;
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error;
    }
  };

  // CRUD operations for categories
  const addCategory = async (categoryData) => {
    const newCategory = createCategoryModel(categoryData);
    try {
      const response = await CategoryService.createCategory(newCategory);
      const updatedCategories = [...categories, response];
      setCategories(updatedCategories);
      return response;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const response = await CategoryService.updateCategory(id, categoryData);
      const updatedCategories = categories.map((category) =>
        category.id === id || category.$id === id ? response : category
      );
      setCategories(updatedCategories);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await CategoryService.deleteCategory(id);
      const updatedCategories = categories.filter(
        (category) => category.id !== id && category.$id !== id
      );
      setCategories(updatedCategories);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // CRUD operations for authors
  const addAuthor = async (authorData) => {
    const newAuthor = createAuthorModel(authorData);
    try {
      const response = await AuthorService.createAuthor(newAuthor);
      const updatedAuthors = [...authors, response];
      setAuthors(updatedAuthors);
      return response;
    } catch (error) {
      console.error('Error adding author:', error);
      throw error;
    }
  };

  const updateAuthor = async (id, authorData) => {
    try {
      const response = await AuthorService.updateAuthor(id, authorData);
      const updatedAuthors = authors.map((author) =>
        author.id === id || author.$id === id ? response : author
      );
      setAuthors(updatedAuthors);
      return response;
    } catch (error) {
      console.error('Error updating author:', error);
      throw error;
    }
  };

  const deleteAuthor = async (id) => {
    try {
      await AuthorService.deleteAuthor(id);
      const updatedAuthors = authors.filter(
        (author) => author.id !== id && author.$id !== id
      );
      setAuthors(updatedAuthors);
      return true;
    } catch (error) {
      console.error('Error deleting author:', error);
      throw error;
    }
  };

  // CRUD operations for publishers
  const addPublisher = async (publisherData) => {
    const newPublisher = createPublisherModel(publisherData);
    try {
      const response = await PublisherService.createPublisher(newPublisher);
      const updatedPublishers = [...publishers, response];
      setPublishers(updatedPublishers);
      return response;
    } catch (error) {
      console.error('Error adding publisher:', error);
      throw error;
    }
  };

  const updatePublisher = async (id, publisherData) => {
    try {
      const response = await PublisherService.updatePublisher(
        id,
        publisherData
      );
      const updatedPublishers = publishers.map((publisher) =>
        publisher.id === id || publisher.$id === id ? response : publisher
      );
      setPublishers(updatedPublishers);
      return response;
    } catch (error) {
      console.error('Error updating publisher:', error);
      throw error;
    }
  };

  const deletePublisher = async (id) => {
    try {
      await PublisherService.deletePublisher(id);
      const updatedPublishers = publishers.filter(
        (publisher) => publisher.id !== id && publisher.$id !== id
      );
      setPublishers(updatedPublishers);
      return true;
    } catch (error) {
      console.error('Error deleting publisher:', error);
      throw error;
    }
  };

  // Update statistics
  const updateStatistics = async (statsData) => {
    try {
      const updatedStats = {
        ...statistics,
        ...statsData,
        updatedAt: new Date().toISOString(),
      };

      const response = await StatisticsService.updateStatistics(updatedStats);
      setStatistics(response);
      return response;
    } catch (error) {
      console.error('Error updating statistics:', error);
      throw error;
    }
  };

  // Handle login
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const session = await AuthService.login(email, password);
      if (session.$id) {
        const user = await AuthService.getCurrentUser();
        setUser(user);
        setIsAdmin(user?.isAdmin || false);
        setAuthenticated(true);
        return user;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (email, password, name) => {
    try {
      setLoading(true);
      const user = await AuthService.createAccount(email, password, name);
      if (user.$id) {
        // Login after registration
        await handleLogin(email, password);
        return user;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Invite a user (admin only)
  const inviteUser = async (email, isAdmin = false) => {
    if (!user?.isAdmin) {
      throw new Error('Only admins can invite users');
    }

    try {
      return await AuthService.inviteUser(email, isAdmin);
    } catch (error) {
      console.error('Invite user error:', error);
      throw error;
    }
  };

  // Context value
  const contextValue = {
    authenticated,
    loading,
    user,
    isAdmin,
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
    handleLogin,
    handleRegister,
    handleLogout,
    toggleTheme,
    refreshData: loadAllCollections,
    createBookModel,
    createLoanModel,
    createCategoryModel,
    createAuthorModel,
    createPublisherModel,
    inviteUser,
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
