const decreaseQuantity = async (productCode) => {
  try {
    const token = Cookies.get('jwt'); // Get the JWT token from the cookie

    const response = await fetch(`https://192.168.29.109:7000/product/cart/items/${productCode}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`, // Include the JWT token in the request headers
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const { message, cart } = await response.json();
      console.log(message);
      console.log(cart);

      // Update the scannedProducts array with the updated cart if needed
      if (cart !== null) {
        const updatedCartData = JSON.parse(cart);
        const updatedScannedProducts = scannedProducts.map((prevProduct) => {
          if (prevProduct.product.productCode === productCode) {
            return {
              ...prevProduct,
              product: {
                ...prevProduct.product,
                quantity: updatedCartData.items.find(
                  (item) => item.productCode === productCode
                ).quantity,
                price: updatedCartData.items.find(
                  (item) => item.productCode === productCode
                ).price.toFixed(2),
              },
            };
          }
          return prevProduct;
        });
        setScannedProducts(updatedScannedProducts);
      } else {
        // If cart is null, remove the product from the scannedProducts array
        setScannedProducts((prevProducts) =>
          prevProducts.filter(
            (prevProduct) => prevProduct.product.productCode !== productCode
          )
        );
      }
    } else {
      const errorResponse = await response.json();
      console.error('Error:', errorResponse);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  setScannedProducts((prevProducts) =>
    prevProducts.reduce((updatedProducts, prevProduct) => {
      if (prevProduct.product.productCode === productCode) {
        // Decrease the quantity by 1, or remove the product if the quantity is 1
        if (prevProduct.quantity === 1) {
          return updatedProducts;
        } else {
          return [
            ...updatedProducts,
            { ...prevProduct, quantity: prevProduct.quantity - 1 },
          ];
        }
      } else {
        return [...updatedProducts, prevProduct];
      }
    }, [])
  );
};
