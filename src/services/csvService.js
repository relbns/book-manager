// src/services/csvService.js
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Function to safely import data from CSV files
export const importFromCSV = (file, importType = 'books') => {
    return new Promise((resolve, reject) => {
        // Configure PapaParse with security options
        const securityOptions = {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
            complete: (results) => {
                try {
                    // Validate imported data
                    const validatedData = validateImportData(results.data, importType);
                    resolve(validatedData);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(new Error(`CSV parsing error: ${error.message}`));
            }
        };

        Papa.parse(file, securityOptions);
    });
};

// Validate and sanitize imported data
const validateImportData = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format or empty CSV');
    }

    // Define required fields for each type
    const requiredFields = {
        books: ['title'],
        authors: ['name'],
        publishers: ['name'],
        categories: ['name'],
        loans: ['bookId', 'borrowerName']
    };

    // Check if required fields exist
    const firstRow = data[0];
    const required = requiredFields[type] || [];
    const missingFields = required.filter(field => !(field in firstRow));

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Sanitize data
    return data.map(row => {
        // Create a new object with sanitized values
        const sanitizedRow = {};

        // Process each property to prevent prototype pollution
        Object.keys(row).forEach(key => {
            // Skip __proto__ and constructor
            if (key === '__proto__' || key === 'constructor' || key.startsWith('__')) {
                return;
            }

            // Sanitize string values
            const value = row[key];
            if (typeof value === 'string') {
                // Trim and limit string length to prevent ReDoS
                sanitizedRow[key] = value.trim().substring(0, 5000);
            } else {
                sanitizedRow[key] = value;
            }
        });

        return sanitizedRow;
    });
};

// Function to export data to CSV
export const exportToCSV = (data, fileName = 'export.csv') => {
    try {
        // Convert data to CSV string
        const csv = Papa.unparse(data, {
            quotes: true, // Put quotes around all fields
            delimiter: ",", // Use comma as delimiter
            header: true // Include header row
        });

        // Create blob and save
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, fileName);
        return true;
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new Error(`Failed to export to CSV: ${error.message}`);
    }
};

// Convert data from one collection to another format (for import/export)
export const convertCollectionFormat = (data, fromType, toType) => {
    // Handle different collection conversions here
    // (e.g., for specific field mappings between different formats)

    return data.map(item => {
        // Create a copy to avoid modifying original
        const result = { ...item };

        // Example: Convert date strings to ISO format
        if (result.loanDate) {
            try {
                result.loanDate = new Date(result.loanDate).toISOString();
            } catch (e) {
                // Keep original if conversion fails
            }
        }

        return result;
    });
};

export default {
    importFromCSV,
    exportToCSV,
    convertCollectionFormat
};