# Label Generator App

A simple web application for generating manufacturing and expiration date labels for printing.

## Features

- **Easy Input**: Enter the number of labels you need
- **Automatic Date Calculation**: 
  - Manufacturing date: Today's date
  - Expiration date: Today's date + 1.5 months (1 month + 15 days)
- **Optimal Paper Usage**: Labels are arranged to minimize paper waste on A4 sheets
- **Professional Layout**: Each label is 2" x 2" with a border
- **Auto-Print**: Option to automatically print the generated PDF
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Open the App**: Open `index.html` in any modern web browser
2. **Enter Label Count**: Input the number of labels you need in the text field
3. **Review Dates**: The app automatically shows the manufacturing and expiration dates
4. **Generate PDF**: Click "Generate PDF" to create your labels
5. **Print**: Use the "Print Labels" button for automatic printing, or print the downloaded PDF manually

## Technical Details

- **Label Size**: 2" × 2" (50.8mm × 50.8mm)
- **Paper Format**: A4 (210mm × 297mm)
- **Labels per Page**: Up to 20 labels per A4 sheet (4 columns × 5 rows)
- **Date Format**: DD/MM/YYYY
- **File Format**: PDF with automatic download

## Files

- `index.html` - Main application interface
- `style.css` - Styling and responsive design
- `script.js` - Application logic and PDF generation
- `README.md` - This documentation file

## Browser Requirements

- Modern web browser with JavaScript enabled
- PDF viewing capability for printing
- Internet connection (for jsPDF library)

## Usage Tips

- The app automatically calculates dates based on the current date
- Labels are optimally arranged to minimize paper waste
- PDF files are automatically named with the date and label count
- For best printing results, use A4 paper and ensure your printer is set to actual size (not "fit to page")

## Example Output

Each label contains:
```
MFG - 15/12/2024
BEST BEFORE - 30/01/2025
```

The labels are arranged in a grid pattern with proper spacing and borders for easy cutting.