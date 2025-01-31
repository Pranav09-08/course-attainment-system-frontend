// Function to format dates
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Function to format numbers (e.g., add commas for thousands)
  export const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };
  