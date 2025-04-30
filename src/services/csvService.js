// src/services/csvService.js - Updated with JSON export support
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
                    let validatedData = validateImportData(results.data, importType); // Changed const to let

                    // Handle specific importType data transformations
                    if (importType === 'books') {
                        // Convert Hebrew column names to English if present
                        validatedData = validatedData.map(row => {
                            const transformed = { ...row };

                            // Map Hebrew column names to English property names if present
                            if ('שם הספר' in row && !('title' in row)) transformed.title = row['שם הספר'];
                            if ('מחבר' in row && !('author' in row)) transformed.author = row['מחבר'];
                            if ('סדרה' in row && !('series' in row)) transformed.series = row['סדרה'];
                            if ('כרך בסדרה' in row && !('volumeInSeries' in row)) {
                                transformed.volumeInSeries = parseInt(row['כרך בסדרה']) || null;
                            }
                            if ('חלק' in row && !('part' in row)) transformed.part = row['חלק'];
                            if ('סך כרכים בסדרה' in row && !('totalVolumesInSeries' in row)) {
                                transformed.totalVolumesInSeries = parseInt(row['סך כרכים בסדרה']) || null;
                            }
                            if ('סיווג' in row && !('classification' in row)) transformed.classification = row['סיווג'];
                            if ('הערות' in row && !('notes' in row)) transformed.notes = row['הערות'];
                            if ('הושאל' in row && !('isLoaned' in row)) {
                                // Convert string values like "כן", "yes", "true" to boolean
                                const loanedValue = String(row['הושאל']).toLowerCase();
                                transformed.isLoaned = ['כן', 'yes', 'true', '1'].includes(loanedValue);
                            }

                            return transformed;
                        });
                    }

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
        books: ['title'], // Allow both 'title' and 'שם הספר'
        authors: ['name'],
        publishers: ['name'],
        categories: ['name'],
        loans: ['bookId', 'borrowerName']
    };

    // Check if required fields exist (accounting for Hebrew field names)
    const firstRow = data[0];
    const required = requiredFields[type] || [];

    // Modified to check for Hebrew field names as well
    let missingFields = required.filter(field => {
        if (field === 'title' && ('שם הספר' in firstRow)) {
            return false; // Not missing if Hebrew equivalent exists
        }
        return !(field in firstRow);
    });

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

// New function to export data to JSON
export const exportToJSON = (data, fileName = 'export.json') => {
    try {
        // Convert data to JSON string with pretty formatting
        const json = JSON.stringify(data, null, 2);

        // Create blob and save
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        saveAs(blob, fileName);
        return true;
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        throw new Error(`Failed to export to JSON: ${error.message}`);
    }
};

// Convert data from one collection to another format (for import/export)
export const convertCollectionFormat = (data, fromType, toType) => {
    // Handle different collection conversions here
    if (fromType === 'books' && toType === 'csv') {
        // For CSV export, we can translate field names to Hebrew for better readability
        return data.map(item => {
            return {
                'ID': item.id,
                'שם הספר': item.title,
                'מחבר': item.author,
                'סדרה': item.series || '',
                'כרך בסדרה': item.volumeInSeries || '',
                'חלק': item.part || '',
                'סך כרכים בסדרה': item.totalVolumesInSeries || '',
                'סיווג': item.classification || '',
                'הערות': item.notes || '',
                'הושאל': item.isLoaned ? 'כן' : 'לא',
                'הוצאה לאור': item.publisher || '',
                'מק"ט': item.isbn || '',
                'שנת הוצאה': item.publicationYear || '',
                'שפה': item.language || '',
                'מספר עמודים': item.pageCount || '',
                'מיקום': item.location || '',
                'תאריך רכישה': item.acquisitionDate || '',
                'דירוג': item.rating || '',
            };
        });
    }

    // Default: return the data unchanged
    return data;
};

export default {
    importFromCSV,
    exportToCSV,
    exportToJSON,
    convertCollectionFormat
};
