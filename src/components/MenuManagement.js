import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Card, Badge, Spinner } from 'react-bootstrap';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const MenuManagement = ({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Biryani',
    price: '',
    description: '',
    available: true,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || product.productName || '',
        category: product.category || 'Biryani',
        price: product.price || '',
        description: product.description || '',
        available: product.available !== undefined ? product.available : true,
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Biryani',
        price: '',
        description: '',
        available: true,
        image: ''
      });
    }
    setImageFile(null);
    setError('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      const storageRef = ref(storage, `menu-images/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!formData.price || Number(formData.price) <= 0) {
        throw new Error('Valid price is required');
      }

      let imageUrl = formData.image;
      
      // Upload new image if selected
      if (imageFile) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(imageFile);
        console.log('Image uploaded:', imageUrl);
      }
      
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        description: formData.description.trim(),
        available: formData.available,
        image: imageUrl || "https://www.licious.in/blog/wp-content/uploads/2020/12/Hyderabadi-chicken-Biryani.jpg"
      };
      
      console.log(' Sending product to Firebase:', productData);
      
      if (editingProduct) {
        await onUpdateProduct({ 
          ...editingProduct,
          ...productData 
        });
      } else {
        await onAddProduct(productData);
      }
      
      // Close modal only if successful
      handleCloseModal();
      
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'Error saving product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setActionLoading(true);
      try {
        await onDeleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleAvailability = async (productId) => {
    setActionLoading(true);
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        await onUpdateProduct({ ...product, available: !product.available });
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2> MENU ITEMS</h2>
              <p className="text-muted"> Restaurant Menu Item List</p>
              <div className="d-flex gap-3">
                <Badge bg="primary">Total: {products.length} items</Badge>
                <Badge bg="success">Available: {products.filter(p => p.available).length}</Badge>
                <Badge bg="secondary">Out of Stock: {products.filter(p => !p.available).length}</Badge>
              </div>
            </div>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => handleShowModal()}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner animation="border" size="sm" /> : ' Add New Item'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          <strong> Error:</strong> {error}
        </Alert>
      )}

      {/* Products Grid */}
      <div className="row g-4">
        {products.length === 0 ? (
          <div className="col-12">
            <Alert variant="info" className="text-center">
              <h5> No menu items found!</h5>
              <p>Click "Add New Item" to create your first menu item.</p>
            </Alert>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="col-xl-4 col-lg-6 col-md-6">
              <Card className={`h-100 shadow-sm ${!product.available ? 'opacity-50' : ''}`}>
                <div className="row g-0 h-100">
                  <div className="col-5">
                    <Card.Img 
                      src={product.image} 
                      alt={product.name || product.productName}
                      style={{ 
                        height: '100%', 
                        objectFit: 'cover',
                        minHeight: '180px'
                      }}
                      onError={(e) => {
                        e.target.src = "https://www.licious.in/blog/wp-content/uploads/2020/12/Hyderabadi-chicken-Biryani.jpg";
                      }}
                    />
                  </div>
                  <div className="col-7">
                    <Card.Body className="d-flex flex-column h-100 p-3">
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="h6 mb-0 text-truncate" title={product.name || product.productName}>
                            {product.name || product.productName}
                          </Card.Title>
                          <Badge bg={
                            product.category === 'Biryani' ? 'primary' : 
                            product.category === 'Starter' ? 'success' : 
                            product.category === 'Mandi' ? 'warning' :
                            product.category === 'Dessert' ? 'info' : 'secondary'
                          }>
                            {product.category}
                          </Badge>
                        </div>
                        <Card.Text className="small text-muted mb-2 line-clamp-2">
                          {product.description || 'No description'}
                        </Card.Text>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <h5 className="text-success mb-0">₹{product.price}</h5>
                        <Badge bg={product.available ? 'success' : 'danger'}>
                          {product.available ? 'Available' : 'Out of Stock'}
                        </Badge>
                      </div>
                      
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          variant="warning"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleShowModal(product)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Spinner size="sm" /> : ' Edit'}
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleToggleAvailability(product.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Spinner size="sm" /> : (product.available ? ' Hide' : ' Show')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleDelete(product.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Spinner size="sm" /> : ' Delete'}
                        </Button>
                      </div>
                    </Card.Body>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? ' Edit Menu Item' : 'Add New Menu Item'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                <strong> Error:</strong> {error}
              </Alert>
            )}
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label> Item Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                    disabled={uploading}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label> Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={uploading}
                  >
                    <option value="Biryani"> Biryani</option>
                    <option value="Starter"> Starter</option>
                    <option value="Mandi"> Mandi</option>
                   
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label> Price (₹) *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
                placeholder="Enter price"
                disabled={uploading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label> Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the menu item..."
                disabled={uploading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label> Product Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    className="border shadow-sm"
                  />
                  <div className="mt-1">
                    <small className="text-muted">Image Preview</small>
                  </div>
                </div>
              )}
              <Form.Text className="text-muted">
                {uploading ? 'Uploading image...' : 'Upload an image for your menu item (optional)'}
              </Form.Text>
            </Form.Group>

            <Form.Check
              type="checkbox"
              name="available"
              label=" Available for ordering"
              checked={formData.available}
              onChange={handleInputChange}
              disabled={uploading}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleCloseModal} 
              disabled={uploading}
            >
               Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingProduct ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingProduct ? ' Update Item' : ' Add Item'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;