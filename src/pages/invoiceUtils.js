// invoiceUtils.js
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

export const getUserToken = () => {
  // Retrieve user token from local storage after login
  const userToken = Cookies.getItem('userToken');

  if (userToken) {
    // Decode the user token to get user details
    const decodedUser = jwt_decode(userToken);
    return decodedUser;
  }

  return null;
};

export const fetchLastInvoice = async (userId) => {
  try {
    const response = await fetch(`/api/customers/invoice?userId=${userId}`);
    const data = await response.json();
    const sortedInvoices = data.invoices.sort((a, b) => b.date - a.date); // Sort invoices by date in descending order
    return sortedInvoices[0]; // Return the most recent invoice
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const findMissingProducts = (cartProducts, lastInvoice) => {
  if (cartProducts.length === 0 || !lastInvoice.products || lastInvoice.products.length === 0) {
    return [];
  }

  return lastInvoice.products.filter((invoiceProduct) => {
    return !cartProducts.some((cartProduct) => cartProduct._id === invoiceProduct._id);
  });
};
