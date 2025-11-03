import React, { useState } from 'react';
import { Modal, Button, Form, Table, Badge, Card, ListGroup, Alert } from 'react-bootstrap';

const OrderManagement = ({ products = [], orders = [], onPlaceOrder, onUpdateOrderStatus }) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState('');
  // const [customerPhone, setCustomerPhone] = useState('');
  // const [tableNumber, setTableNumber] = useState('');
  // const [orderType, setOrderType] = useState('dine-in');

  const addToOrder = (product) => {
    const existingItem = currentOrder.find(item => item.id === product.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCurrentOrder([...currentOrder, { 
        id: product.id,
        productId: product.id,
        name: product.name || product.productName,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const removeFromOrder = (productId) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromOrder(productId);
      return;
    }
    setCurrentOrder(currentOrder.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }

    // if (orderType === 'dine-in' && !tableNumber.trim()) {
    //   alert('Please enter table number for dine-in orders');
    //   return;
    // }

    const newOrder = {
      customerName: customerName.trim(),
      // phone: customerPhone.trim() || null,
      // tableNumber: orderType === 'dine-in' ? tableNumber.trim() : null,
      // orderType: orderType,
      items: currentOrder.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: getOrderTotal(),
      status: 'Pending'
    };

    console.log('Placing order:', newOrder);
    
    onPlaceOrder(newOrder);
    resetOrderForm();
  };

  const resetOrderForm = () => {
    setCurrentOrder([]);
    setCustomerName('');
    // setCustomerPhone('');
    // setTableNumber('');
    // setOrderType('dine-in');
    setShowOrderModal(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Preparing': return 'info';
      case 'Ready': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const availableProducts = products.filter(p => p.available);

  const getOrderItemsText = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 'No items';
    return order.items.map(item => 
      `${item.name || 'Unknown'} (x${item.quantity})`
    ).join(', ');
  };

  const getOrderTime = (order) => {
    if (!order.timestamp) return 'Unknown';
    try {
      if (order.timestamp.toDate) {
        return order.timestamp.toDate().toLocaleTimeString();
      }
      return new Date(order.timestamp).toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2> Orders List</h2>
                <p className="text-muted"> Restaurant Orders List</p>
              <div className="d-flex gap-3">
               <Badge bg='primary'> Total Orders: {orders.length} </Badge> 
               <Badge bg='info'> Active: {orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length} </Badge>
                <Badge bg='success'> Completed: {orders.filter(o => o.status === 'Completed').length} </Badge>
              </div>
            </div>
            <button 
              className="btn btn-success btn-lg"
              onClick={() => setShowOrderModal(true)}
            >
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="row">
        <div className="col-12">
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0"> All Orders</h5>
            </Card.Header>
            <Card.Body>
              {orders.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <h5> No orders yet!</h5>
                  <p>Create your first order to get started.</p>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        {/* <th>Type</th> */}
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td className="fw-bold">
                            {order.orderNumber || `ORD-${order.id?.substring(0, 8)}`}
                          </td>
                          <td>
                            <div>
                              <strong>{order.customerName}</strong>
                              {/* {order.phone && <small className="text-muted">{order.phone}</small>}
                              {order.tableNumber && <small className="text-muted"> Table {order.tableNumber}</small>} */}
                            </div>
                          </td>

                          {/* <td>
                            <Badge bg={order.orderType === 'dine-in' ? 'primary' : 'secondary'}>
                              {order.orderType === 'dine-in' ? '🍽️ Dine-in' : '🥡 Takeaway'}
                            </Badge>
                          </td> */}

                          <td>
                            <small>{getOrderItemsText(order)}</small>
                          </td>
                          <td className="fw-bold text-success">₹{order.total || 0}</td>
                          <td>
                            <Badge bg={getStatusVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">{getOrderTime(order)}</small>
                          </td>
                          <td>
                            <select 
                              className="form-select form-select-sm"
                              value={order.status || 'Pending'}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="Pending"> Pending</option>
                              <option value="Preparing"> Preparing</option>
                              <option value="Ready"> Ready</option>
                              <option value="Completed"> Completed</option>
                              <option value="Cancelled"> Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Order Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="xl" scrollable>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title> Create New Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-8">
              <h5> Available Menu Items ({availableProducts.length})</h5>
              {availableProducts.length === 0 ? (
                <Alert variant="warning" className="text-center">
                  <h6> No available products</h6>
                  <p>All menu items are currently out of stock. Please update product availability.</p>
                </Alert>
              ) : (
                <div className="row g-3">
                  {availableProducts.map(product => (
                    <div key={product.id} className="col-md-6 col-lg-4">
                      <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title text-primary mb-0">
                                {product.name || product.productName}
                              </h6>
                              <Badge bg="secondary">{product.category}</Badge>
                            </div>
                            <p className="card-text small text-muted mb-2">
                              {product.description || 'No description available'}
                            </p>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <Badge bg="success" className="fs-6">₹{product.price}</Badge>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => addToOrder(product)}
                            >
                               Add to Order
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-md-4">
              <Card className="sticky-top" style={{top: '20px'}}>
                <Card.Header className="bg-warning">
                  <h5 className="mb-0"> Current Order</h5>
                </Card.Header>
                <Card.Body>
                
                  {/* <Form.Group className="mb-3">
                    <Form.Label>Order Type *</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        label=" Dine-in"
                        name="orderType"
                        checked={orderType === 'dine-in'}
                        onChange={() => setOrderType('dine-in')}
                        className="mb-1"
                      />
                      <Form.Check
                        type="radio"
                        label="🥡 Takeaway"
                        name="orderType"
                        checked={orderType === 'takeaway'}
                        onChange={() => setOrderType('takeaway')}
                      />
                    </div>
                  </Form.Group> */}

                  {/* Customer Information */}
                  <Form.Group className="mb-3">
                    <Form.Label>Customer Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </Form.Group> */}
{/* 
                  {orderType === 'dine-in' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Table Number *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter table number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        required
                      />
                    </Form.Group>
                  )} */}

                  {/* Order Items */}
                  {currentOrder.length > 0 ? (
                    <>
                      <h6>Order Items:</h6>
                      <ListGroup className="mb-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        {currentOrder.map(item => (
                          <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                              <strong>{item.name}</strong>
                              <br />
                              <small className="text-muted">₹{item.price} each</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="mx-2 fw-bold">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => removeFromOrder(item.id)}
                                className="ms-2"
                              >
                                🗑️
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      <Card className="bg-light">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Total:</h5>
                            <h4 className="text-success mb-0">₹{getOrderTotal()}</h4>
                          </div>
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <Alert variant="info" className="text-center mb-0">
                      <h6> No items added</h6>
                      <p className="mb-0">Select items from the menu to create your order</p>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div>
              {currentOrder.length > 0 && (
                <strong>Total: ₹{getOrderTotal()}</strong>
              )}
            </div>
            <div>
              <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                 Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={placeOrder}
                disabled={currentOrder.length === 0 || !customerName.trim() }
                className="ms-2"
              >
                 Place Order
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagement;