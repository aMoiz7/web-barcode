import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@mui/material'
import Quagga from 'quagga';
import Cookies from 'js-cookie';
import "./index.css";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// token user header

//
const Scanner = (props) => {
  const token = Cookies.get('jwt');
  const firstUpdate = useRef(true);
  const [isStart, setIsStart] = useState(false);
  const [barcode, setBarcode] = useState('');
  var products 
  const [scannedProducts, setScannedProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [lastInvoiceProducts, setLastInvoiceProducts] = useState([]);
  const [missingProducts, setMissingProducts] = useState([]);
  const [shownNotifications, setShownNotifications] = useState([]);
   // Ref for the canvas element


   useEffect(() => {
    const storedProducts = localStorage.getItem('scannedProducts');
    if (storedProducts) {
      setScannedProducts(JSON.parse(storedProducts));
    }
  
    const expirationTime = new Date().getTime() + 8 * 60 * 60 * 1000 // Calculate the expiration time (10 seconds from now)

const removeData = () => {
  const currentTime = new Date().getTime();
  if (currentTime >= expirationTime) {
    localStorage.removeItem('scannedProducts');
    setScannedProducts([]);
  }
};

const interval = setInterval(removeData, 1000);
 // Check expiration every second
  
    return () => {
      clearInterval(interval);
      if (isStart) {
        stopScanner();
      }
    };
  }, [isStart]);
  
  
  
  

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    if (isStart) startScanner();
    else stopScanner();
  }, [isStart]);


 
  

  const _onDetected = res => {
    // stopScanner();
    setBarcode(res.codeResult.code.toString());
  };

  const startScanner = () => {
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: document.querySelector('#scanner-container'),
          constraints: {
            facingMode: 'environment' ,
            // or user

          }
        },
        numOfWorkers: navigator.hardwareConcurrency,
        locate: true,
        frequency: 1,
        debug: {
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
          showPattern: true
        },
        multiple: false,
        locator: {
          halfSample: false,
          patchSize: 'medium', // x-small, small, +, large, x-large
          debug: {
            showCanvas: false,
            showPatches: false,
            showFoundPatches: false,
            showSkeleton: false,
            showLabels: false,
            showPatchLabels: false,
            showRemainingPatchLabels: false,
            boxFromPatches: {
              showTransformed: false,
              showTransformedBox: false,
              showBB: false
            }
          }
        },
        decoder: {
          readers: [
            'code_128_reader',
            'ean_reader',
            'ean_8_reader',
            'code_39_reader',
            'code_39_vin_reader',
            'codabar_reader',
            'upc_reader',
            'upc_e_reader',
            'i2of5_reader',
            'i2of5_reader',
            '2of5_reader',
            'code_93_reader'
          ]
        }
      },
      err => {
        if (err) {
          return console.log(err);
        }
        Quagga.start();
      }
    );
    Quagga.onDetected(_onDetected);
    Quagga.onProcessed(result => {
      let drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute('width')),
            parseInt(drawingCanvas.getAttribute('height'))
          );
          result.boxes.filter(box => box !== result.box).forEach(box => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
              color: 'green',
              lineWidth: 2
            });
          });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
        }
      }

     
    });
  };

  const stopScanner = () => {
    Quagga.offProcessed();
    Quagga.offDetected();
    Quagga.stop();
  };


/////chat gtp


// code 128 decoder chatgpt
function decodeCode128Barcode(barcode) {
  const regex = /^9700(\d{4})(\d{4})(\d{4})$/;
  const match = barcode.match(regex);

  if (!match) {
    return "Barcode does not match the expected format.";
  }
  
  const productCode = match[1];
  const weight = parseFloat(match[2]) / 1000; // Divide by 1000 to convert to kg
  const price = parseFloat(match[3]) / 10.0; // Divide by 10 to get the decimal point in the correct place

  return `Product Code: ${productCode}\nWeight: ${weight.toFixed(3)}kg\nProduct Price (Rs.): ${price}`;
}

console.log(decodeCode128Barcode(barcode)); // Output: Store Code: 9700
                                                //         Product Code: 6500
                                                //         Weight: 1.560kg
                                                //         Product Price (Rs.): 118.0

      
// ean 13 

function decodeEAN13India(barcode) {
  
  const regex = /^(\d{8})(\d{4})(\d{1})$/;
  const match = regex.exec(barcode) || [] ;
  if (!match) {
    console.log('Invalid barcode');
  }
 
  const companyPrefix = match[1];
  const productCode = match[2];
  const checkDigit = match[3]
  
  return {
  
    companyPrefix,
    productCode,
    checkDigit,
  };
}





//ean 13 end

const decoded = decodeEAN13India(barcode);
console.log(decoded);
///
///

const calculatePrice = () => {
  let total = 0;
  for (let i = 0; i < scannedProducts.length; i++) {
    const product = scannedProducts[i].product;
   
    total += parseFloat(product.price) 
  }
  setTotalPrice(total.toFixed(2));
};
useEffect(() => {
 
 
  const fetchProduct = async () => {
    try {
      const token = Cookies.get('jwt'); // Get the JWT token from the cookie

      const response = await fetch(`api/product/${barcode}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the JWT token in the request headers
        },
      });

     
    
      
      if (response.ok) {
        const product = await response.json();
      
        // Check if the product already exists in the scannedProducts array
        const existingProductIndex = scannedProducts.findIndex(
          (existingProduct) => existingProduct.barcode === barcode
        );
      
        if (existingProductIndex !== -1) {
          // Update the existing product in the array
          const updatedScannedProducts = [...scannedProducts];
          updatedScannedProducts[existingProductIndex] = { barcode, product };
          setScannedProducts(updatedScannedProducts);
          
        } else {
          // Add the new product to the array
          setScannedProducts((prevProducts) => [...prevProducts, { barcode, product }]);
        }
        
      }
      
    }
       catch (error) {
      console.error('Error:', error);
    }
    
    // Reset the barcode state after fetching the product
    setBarcode('');
    
  };

  if (barcode) {
    fetchProduct();
  }
}, [barcode, products]); // Include products as a dependency to detect changes in the products array
 // Include products as a dependency to detect changes in the products array

 // Include products as a dependency to detect changes in the products array
 
 useEffect(() => {
  localStorage.setItem('scannedProducts', JSON.stringify(scannedProducts));
  
  calculatePrice();
}, [scannedProducts]);

const decreaseQuantity = async (productCode) => {
  try {
    const token = Cookies.get('jwt'); // Get the JWT token from the cookie
    
    const response = await fetch(`api/product/cart/items/${productCode}`, {
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
        setScannedProducts(prevProducts =>
          prevProducts.filter(prevProduct => prevProduct.product.productCode !== productCode)
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
        return [...updatedProducts, { ...prevProduct, quantity: prevProduct.quantity - 1 }];
      }
    } else {
      return [...updatedProducts, prevProduct];
    }
  }, [])
);



};


const handlePayment = () => {
  // Perform payment logic here
  // Redirect to payment page with the total price
  Cookies.set('totalPrice', totalPrice);
  console.log(totalPrice)
  // Redirect to payment page
  window.location.href = '/payment';
};

//suggestion 

const fetchLastInvoiceProducts = async () => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch('/api/customers/lastInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ scannedProducts }),
    });

    if (response.ok) {
      const data = await response.json();
      setLastInvoiceProducts(data.missingProducts);
    } else {
      console.log('Error fetching last invoice products');
    }
  } catch (error) {
    console.log('Error fetching last invoice products:', error);
  }
};

// Define the compareProducts function outside of useEffect
const compareProducts = () => {
  if (scannedProducts.length === 0) {
    return;
  }

  const updatedMissingProducts = lastInvoiceProducts.filter(
    (invoiceProduct) => !scannedProducts.map((product) => product.product.name).includes(invoiceProduct)
  );

  // Function to show missing product notification one by one
  const showMissingProductNotification = (products, index) => {
    if (index < products.length) {
      const product = products[index];
      const toastId = `missing_product_${product}`;

      // Check if the notification is not already shown
      if (!shownNotifications.includes(toastId)) {
        toast.error(`Missing product: ${product}`, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 4000,
          toastId: toastId,
          onClose: () => {
            // Trigger the next notification after the previous one is closed
            showMissingProductNotification(products, index + 1);
          },
        });

        // Add the notification to the list of shown notifications
        setShownNotifications([...shownNotifications, toastId]);
      } else {
        // If the notification is already shown, trigger the next notification
        showMissingProductNotification(products, index + 1);
      }
    }
  };

  // Show the missing product notifications one by one
  showMissingProductNotification(updatedMissingProducts, 0);

  // Remove toast notifications for added products
  scannedProducts.forEach((product) => {
    toast.dismiss(`missing_product_${product.product.name}`); // Dismiss the toast notification with the product name as the toastId
  });

  setMissingProducts(updatedMissingProducts);
};

useEffect(() => {
  const fetchAndCompare = async () => {
    await fetchLastInvoiceProducts();
    compareProducts();
  };

  if (scannedProducts.length > 0) {
    fetchAndCompare();
  }
}, [scannedProducts]);
//suggestion end

  /////gtpcode end
  return  <div>
     <ToastContainer />
   <Button variant="contained" size="medium" color="secondary"  onClick={() => setIsStart(prevStart => !prevStart)} style={{ marginBottom: 20 }}>
   {isStart ? 'Stop' : 'Start'}
                        <svg xmlns="http://www.w3.org/2000/svg " width="100" height="100" style={{padding:30}} fill="currentColor" class="bi bi-upc-scan" viewBox="0 0 16 16">
                            <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"/>
                        </svg>
                    </Button>
    
    {isStart && <React.Fragment>
      <div id="scanner-container">
      <video autoPlay="{true}" preload="auto" src muted="true" playsInline="true" id='scanner-container'></video>
      </div>

      <span>Barcode: {barcode}</span>
      <label >{barcode}</label>
      
      
    </React.Fragment>}

    <label htmlFor="name"><h6>Concept & development by : Abdul Moiz Hussain</h6>
      <h6>Email : moizh750@gmail.com </h6>
      </label>
      <br />

    <input type="text" value={barcode} disabled />
    <div className="table-container">
  <table>
    <thead>
      <tr>
        {/* <th>Barcode</th> */}
        <th>Name</th>
        <th>Weight</th>
        <th>Product Price</th>
        <th>Total Price</th>
        <th>Quantity</th>
        {/* <th>code</th> */}
      </tr>
    </thead>
    <tbody className="table-inside">
      {scannedProducts.map(({ barcode, product }) => (
        <tr key={barcode}>
          {/* <td>{barcode}</td> */}
          <td>{product.name}</td>
          <td>{product.weight}</td>
          <td>{product.originalPrice}</td>
          <td>{product.price}</td>
          <td>{product.quantity}</td>
          {/* <td>{product.productCode}</td> */}
          <td>
            <DeleteForeverIcon onClick={() => decreaseQuantity(product.productCode)} className='button'>Del</DeleteForeverIcon>
          </td>
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan="2">Total:</td>
        <td>{totalPrice}</td>
      </tr>
    </tfoot>
  </table>
</div>

<Button variant="contained" onClick={handlePayment} disabled = {totalPrice == 0.00}>
  Make Payment
</Button>
{/* <Button variant="contained" size="large" color="primary" onClick={handlePayment} style={{ marginTop: 20 }}>
        Pay
      </Button> */}

  </div>
}


export default Scanner;

