// Global variables
let currentMfgDate = '';
let currentExpDate = '';
let generatedPDF = null;

// DOM elements
const labelCountInput = document.getElementById('labelCount');
const mfgDateSpan = document.getElementById('mfgDate');
const expDateSpan = document.getElementById('expDate');
const previewMfg = document.getElementById('previewMfg');
const previewExp = document.getElementById('previewExp');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateDates();
    setupEventListeners();
});

function setupEventListeners() {
    labelCountInput.addEventListener('input', function() {
        const count = parseInt(this.value);
        if (count > 0) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
            printBtn.disabled = true;
        }
    });

    generateBtn.addEventListener('click', generatePDF);
    printBtn.addEventListener('click', printPDF);
}

function updateDates() {
    const today = new Date();
    
    // Format current date as DD/MM/YYYY
    currentMfgDate = formatDate(today);
    
    // Calculate expiration date (1.5 months = 1 month + 15 days)
    const expDate = new Date(today);
    expDate.setMonth(expDate.getMonth() + 1);
    expDate.setDate(expDate.getDate() + 15);
    currentExpDate = formatDate(expDate);
    
    // Update UI
    mfgDateSpan.textContent = currentMfgDate;
    expDateSpan.textContent = currentExpDate;
    previewMfg.textContent = currentMfgDate;
    previewExp.textContent = currentExpDate;
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function generatePDF() {
    const labelCount = parseInt(labelCountInput.value);
    
    if (!labelCount || labelCount <= 0) {
        alert('Please enter a valid number of labels.');
        return;
    }

    // Show loading state
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;

    try {
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // A4 dimensions: 210mm x 297mm
        // Label dimensions: 2" x 2" = 50.8mm x 50.8mm
        const pageWidth = 210;
        const pageHeight = 297;
        const labelWidth = 50.8;
        const labelHeight = 50.8;
        
        // Calculate labels per page
        const labelsPerRow = Math.floor(pageWidth / labelWidth);
        const labelsPerColumn = Math.floor(pageHeight / labelHeight);
        const labelsPerPage = labelsPerRow * labelsPerColumn;
        
        // Calculate margins to center labels
        const marginLeft = (pageWidth - (labelsPerRow * labelWidth)) / 2;
        const marginTop = (pageHeight - (labelsPerColumn * labelHeight)) / 2;
        
        let labelsPlaced = 0;
        let currentPage = 1;
        
        while (labelsPlaced < labelCount) {
            if (labelsPlaced > 0 && labelsPlaced % labelsPerPage === 0) {
                pdf.addPage();
                currentPage++;
            }
            
            const labelOnPage = labelsPlaced % labelsPerPage;
            const row = Math.floor(labelOnPage / labelsPerRow);
            const col = labelOnPage % labelsPerRow;
            
            const x = marginLeft + (col * labelWidth);
            const y = marginTop + (row * labelHeight);
            
            drawLabel(pdf, x, y, labelWidth, labelHeight, currentMfgDate, currentExpDate);
            labelsPlaced++;
        }
        
        generatedPDF = pdf;
        
        // Enable print button
        printBtn.disabled = false;
        
        // Auto-download PDF
        pdf.save(`Labels_${labelCount}_${currentMfgDate.replace(/\//g, '-')}.pdf`);
        
        alert(`PDF generated successfully!\n${labelCount} labels created using ${currentPage} page(s).`);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        // Reset button
        generateBtn.textContent = 'Generate PDF';
        generateBtn.disabled = false;
    }
}

function drawLabel(pdf, x, y, width, height, mfgDate, expDate) {
    // Draw border
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
    
    // Set font
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(8);
    
    // Calculate text positioning
    const textX = x + 2;
    const centerY = y + height / 2;
    
    // Draw MFG line
    pdf.text(`MFG - ${mfgDate}`, textX, centerY - 3);
    
    // Draw BEST BEFORE line
    pdf.text(`BEST BEFORE - ${expDate}`, textX, centerY + 3);
}

function printPDF() {
    if (!generatedPDF) {
        alert('Please generate the PDF first.');
        return;
    }
    
    try {
        // Create blob URL for printing
        const pdfBlob = generatedPDF.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        
        // Create iframe for printing
        const printFrame = document.createElement('iframe');
        printFrame.style.display = 'none';
        printFrame.src = url;
        
        document.body.appendChild(printFrame);
        
        printFrame.onload = function() {
            try {
                printFrame.contentWindow.print();
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                    URL.revokeObjectURL(url);
                }, 1000);
            } catch (error) {
                console.error('Print error:', error);
                alert('Unable to print automatically. Please use the downloaded PDF to print.');
                document.body.removeChild(printFrame);
                URL.revokeObjectURL(url);
            }
        };
        
    } catch (error) {
        console.error('Print error:', error);
        alert('Unable to print automatically. Please use the downloaded PDF to print.');
    }
}

// Update dates on page load and refresh every minute
setInterval(updateDates, 60000);