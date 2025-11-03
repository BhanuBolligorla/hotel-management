import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore'; // Removed orderBy

import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MenuManagement from './components/MenuManagement';
import OrderManagement from './components/OrderManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const restaurantId = "restaurant_001";

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser({
          email: user.email,
          uid: user.uid,
          name: user.email.split('@')[0]
        });
        setupFirebaseListeners();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setProducts([]);
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Setup Real-time Firebase Listeners
  const setupFirebaseListeners = () => {
    setDbError('');
    
    try {
      console.log(' Setting up Firebase listeners...');

      // Products Listener
      const productsQuery = query(
        collection(db, 'products'),
        where('restaurantId', '==', restaurantId)
        // Removed orderBy since we're sorting locally
      );

      const unsubscribeProducts = onSnapshot(productsQuery, 
        (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort locally by createdAt (newest first)
          const sortedProducts = productsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA; // Descending order (newest first)
          });
          
          console.log(' Products updated:', sortedProducts.length, 'items');
          setProducts(sortedProducts);
          setDbError('');
        },
        (error) => {
          console.error(' Firestore products error:', error);
          setDbError(`Database error: ${error.message}`);
        }
      );

      // Orders Listener
      const ordersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', restaurantId)
        // Removed orderBy since we're sorting locally
      );

      const unsubscribeOrders = onSnapshot(ordersQuery, 
        (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort locally by timestamp (newest first)
          const sortedOrders = ordersData.sort((a, b) => {
            const dateA = a.timestamp?.toDate?.() || new Date(0);
            const dateB = b.timestamp?.toDate?.() || new Date(0);
            return dateB - dateA; // Descending order (newest first)
          });
          
          console.log('Orders updated:', sortedOrders.length, 'orders');
          setOrders(sortedOrders);
          setDbError('');
        },
        (error) => {
          console.error(' Firestore orders error:', error);
          setDbError(`Database error: ${error.message}`);
        }
      );

      return () => {
        console.log(' Cleaning up Firebase listeners');
        unsubscribeProducts();
        unsubscribeOrders();
      };
    } catch (error) {
      console.error(' Error setting up listeners:', error);
      setDbError('Failed to connect to database.');
      return () => {};
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setDbError('');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add Product to Firebase
  const addProduct = async (newProduct) => {
    try {
      setLoading(true);
      setDbError('');
      setSuccessMessage('');
      
      console.log(' Adding product data received:', newProduct);
      
      const productName = newProduct.name || newProduct.productName;
      
      if (!productName || !productName.trim()) {
        throw new Error('Product name is required');
      }
      
      if (!newProduct.price || isNaN(newProduct.price) || Number(newProduct.price) <= 0) {
        throw new Error('Valid price is required');
      }

      const productData = {
        name: productName.trim(),
        category: newProduct.category || 'Biryani',
        price: Number(newProduct.price),
        description: newProduct.description?.trim() || '',
        available: newProduct.available !== undefined ? newProduct.available : true,
        image: newProduct.image || "https://www.licious.in/blog/wp-content/uploads/2020/12/Hyderabadi-chicken-Biryani.jpg",
        restaurantId: restaurantId,
        createdAt: serverTimestamp(),
        createdBy: user?.email || 'unknown'
      };

      console.log(' Prepared product data for Firebase:', productData);

      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log(' Product added successfully with ID:', docRef.id);
      
      setSuccessMessage('Product added successfully!');
      
    } catch (error) {
      console.error(' Detailed error adding product:', error);
      setDbError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Product in Firebase
  const updateProduct = async (updatedProduct) => {
    try {
      setLoading(true);
      setDbError('');
      setSuccessMessage('');
      
      console.log(' Updating product:', updatedProduct);
      
      const productName = updatedProduct.name || updatedProduct.productName;
      
      const updateData = {
        name: productName?.trim(),
        category: updatedProduct.category,
        price: Number(updatedProduct.price),
        description: updatedProduct.description?.trim() || '',
        available: updatedProduct.available,
        image: updatedProduct.image,
        updatedAt: serverTimestamp()
      };

      const productRef = doc(db, 'products', updatedProduct.id);
      await updateDoc(productRef, updateData);
      
      console.log(' Product updated successfully');
      setSuccessMessage('Product updated successfully!');
      
    } catch (error) {
      console.error(' Error updating product:', error);
      setDbError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product from Firebase
  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      setDbError('');
      setSuccessMessage('');
      
      await deleteDoc(doc(db, 'products', productId));
      console.log(' Product deleted successfully');
      setSuccessMessage('Product deleted successfully!');
      
    } catch (error) {
      console.error(' Error deleting product:', error);
      setDbError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Place Order in Firebase
  const placeOrder = async (newOrder) => {
    try {
      setLoading(true);
      setDbError('');
      setSuccessMessage('');
      
      console.log(' Placing order:', newOrder);

      // Validate required fields
      if (!newOrder.customerName) {
        throw new Error('Customer name is required');
      }
      if (!newOrder.items || newOrder.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }
      // if (newOrder.orderType === 'dine-in' && !newOrder.tableNumber) {
      //   throw new Error('Table number is required for dine-in orders');
      // }

      // Prepare order data with all required fields
      const orderData = {
        customerName: newOrder.customerName.trim(),
        // phone: newOrder.phone || null,
        // tableNumber: newOrder.tableNumber || null,
        // orderType: newOrder.orderType || 'dine-in',
        items: newOrder.items.map(item => ({
          productId: item.productId || item.id,
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 1,
          price: item.price || 0
        })),
        total: newOrder.total || 0,
        status: newOrder.status || 'Pending',
        restaurantId: restaurantId,
        timestamp: serverTimestamp(),
        orderNumber: `ORD-${Date.now()}`,
        createdBy: user?.email || 'unknown'
      };

      console.log(' Prepared order data for Firebase:', orderData);

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log(' Order placed successfully with ID:', docRef.id);
      
      setSuccessMessage('Order placed successfully!');
      
    } catch (error) {
      console.error(' Error placing order:', error);
      setDbError(`Error placing order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Order Status in Firebase
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      setDbError('');
      
      console.log(' Updating order status:', { orderId, newStatus });

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log(' Order status updated to:', newStatus);
      
    } catch (error) {
      console.error(' Error updating order status:', error);
      setDbError(`Error updating order status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardData = () => {
    const totalItems = products.length;
    const totalOrders = orders.length;
    
    const totalEarnings = orders
      .filter(order => order.status === 'Completed')
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    const currentOrders = orders.filter(order => 
      ['Pending', 'Preparing', 'Ready'].includes(order.status)
    ).length;

    return {
      totalEarnings: totalEarnings,
      totalOrders,
      totalItems,
      currentOrders,
      totalRevenue: totalEarnings
    };
  };

  const dashboardData = calculateDashboardData();

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid " style={{height:"60px"}}>
          <span className="navbar-brand mb-0 h1"> AJA RESTAURANT</span>
          
          <div className="navbar-nav me-auto">
            <button 
              className={`nav-link btn btn-link text-light ${activeTab === 'dashboard' ? 'active fw-bold' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ border: 'none', background: 'none' }}
            >
               Dashboard
            </button>
            <button 
              className={`nav-link btn btn-link text-light ${activeTab === 'menu' ? 'active fw-bold' : ''}`}
              onClick={() => setActiveTab('menu')}
              style={{ border: 'none', background: 'none' }}
            >
               Menu Item ({products.length})
            </button>
            <button 
              className={`nav-link btn btn-link text-light ${activeTab === 'orders' ? 'active fw-bold' : ''}`}
              onClick={() => setActiveTab('orders')}
              style={{ border: 'none', background: 'none' }}
            >
               Orders ({orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length})
            </button>
          </div>

          <div className="navbar-nav">
            <span className="navbar-text me-3 text-light">
               WELCOME, {user?.name || user?.email}
            </span>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? ' Processing...' : ' Logout'}
            </button>
          </div>
        </div>
      </nav>

      {/* Success Message */}
      {successMessage && (
        <div className="container-fluid mt-3">
          <div className="alert alert-success alert-dismissible fade show">
            <strong>Success!</strong> {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage('')}
            ></button>
          </div>
        </div>
      )}

      {/* Database Error Alert */}
      {dbError && (
        <div className="container-fluid mt-3">
          <div className="alert alert-danger alert-dismissible fade show">
            <strong> Database Error:</strong> {dbError}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setDbError('')}
            ></button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="container-fluid mt-3">
          <div className="alert alert-info text-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
             Processing...
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-fluid mt-4">
        {activeTab === 'dashboard' && (
          <Dashboard 
            data={dashboardData}
            products={products}
            orders={orders}
          />
        )}
        {activeTab === 'menu' && (
          <MenuManagement 
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        )}
        {activeTab === 'orders' && (
          <OrderManagement 
            products={products}
            orders={orders}
            onPlaceOrder={placeOrder}
            onUpdateOrderStatus={updateOrderStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;