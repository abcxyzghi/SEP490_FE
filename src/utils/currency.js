function formatCurrency(amount) {
    // Convert the amount to a string and split it into integer and decimal parts
    const parts = amount.toString().split(".");
    
    // Format the integer part with a dot as the thousand separator
    const formattedIntegerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Combine integer part with the currency symbol
    return `${formattedIntegerPart} VND`;
}

export {formatCurrency}