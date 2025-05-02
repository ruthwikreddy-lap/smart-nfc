
import * as XLSX from 'xlsx';
import { ExcelPortfolioData } from '@/lib/types';

// Sample data for the Excel template
export const sampleExcelData: ExcelPortfolioData[] = [
  {
    name: "John Doe",
    title: "Software Engineer",
    bio: "Passionate software engineer with 5+ years of experience in web development and cloud solutions.",
    email: "john@example.com",
    twitter: "johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  },
  {
    name: "Jane Smith",
    title: "UX Designer",
    bio: "Creative UX designer focused on creating intuitive user experiences with a background in psychology.",
    email: "jane@example.com",
    twitter: "janesmith",
    linkedin: "https://linkedin.com/in/janesmith",
    github: "https://github.com/janesmith"
  },
  {
    name: "Robert Johnson",
    title: "Data Scientist",
    bio: "Data scientist with expertise in machine learning and statistical analysis.",
    email: "robert@example.com",
    linkedin: "https://linkedin.com/in/robertjohnson"
  }
];

// Function to generate and download Excel template
export const downloadExcelTemplate = () => {
  const ws = XLSX.utils.json_to_sheet(sampleExcelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Portfolio Template");
  
  // Add column widths for better readability
  const wscols = [
    { wch: 20 }, // name
    { wch: 20 }, // title
    { wch: 50 }, // bio
    { wch: 25 }, // email
    { wch: 15 }, // twitter
    { wch: 30 }, // linkedin
    { wch: 30 }  // github
  ];
  ws['!cols'] = wscols;
  
  XLSX.writeFile(wb, "portfolio_template.xlsx");
};

// Function to validate Excel data
export const validateExcelData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, errors: ["No data found in the Excel file"] };
  }
  
  data.forEach((row, index) => {
    if (!row.name) {
      errors.push(`Row ${index + 1}: Name is required`);
    }
    if (!row.title) {
      errors.push(`Row ${index + 1}: Title is required`);
    }
    if (!row.bio) {
      errors.push(`Row ${index + 1}: Bio is required`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};
