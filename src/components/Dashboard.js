import React, { useState } from "react";
import { Modal, Table, Badge, ListGroup, Card, Button } from "react-bootstrap";

const Dashboard = ({ data = {}, products = [], orders = [] }) => {
  const { 
    totalEarnings = 0, 
    totalOrders = 0, 
    totalItems = 0, 
    currentOrders = 0 
  } = data;

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleCardClick = (stat) => {
    setModalContent(stat);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  // Helper function to format Firebase timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Today';
    
    try {
      // If it's a Firebase Timestamp object
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      
      // If it's a plain object with seconds/nanoseconds
      if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
      }
      
      // If it's already a string
      if (typeof timestamp === 'string') {
        return timestamp.split('T')[0];
      }
      
      return 'Today';
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Today';
    }
  };

  // Helper function to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Recent';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleTimeString();
      }
      
      if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString();
      }
      
      return 'Recent';
    } catch (error) {
      return 'Recent';
    }
  };

  const earningsData = orders
    .filter(order => order.status === 'Completed')
    .map(order => ({
      date: formatTimestamp(order.timestamp),
      orderId: order.orderNumber || `ORD-${order.id?.substring(0, 4)}`,
      amount: `₹${order.total || 0}`,
      type: "Completed",
      items: order.items ? order.items.map(item => `${item.name} x${item.quantity}`).join(', ') : 'No items'
    }));

  const ordersData = orders.map(order => ({
    id: order.orderNumber || `ORD-${order.id?.substring(0, 4)}`,
    customer: order.customerName || 'Unknown Customer',
    status: order.status || 'Pending',
    amount: `₹${order.total || 0}`,
    items: order.items ? order.items.length : 0,
    timestamp: formatTime(order.timestamp)
  }));

  const menuItemsData = products.map(product => ({
    id: product.id,
    name: product.name || product.productName || 'Unnamed Product',
    category: product.category || 'Uncategorized',
    price: `₹${product.price || 0}`,
    status: product.available ? 'Available' : 'Out of Stock',
    orders: orders.filter(order => 
      order.items && order.items.some(item => item.productId === product.id)
    ).length
  }));

  const currentOrdersData = orders
    .filter(order => ['Pending', 'Preparing', 'Ready'].includes(order.status))
    .map(order => ({
      id: order.orderNumber || `ORD-${order.id?.substring(0, 4)}`,
      items: order.items ? order.items.map(item => `${item.name} x${item.quantity}`).join(', ') : 'No items',
      time: "Active",
      status: order.status || 'Pending',
      customer: order.customerName || 'Unknown Customer'
    }));

  const statsConfig = [
    { 
      label: "Total Earnings", 
      value: `₹${totalEarnings}`,
      bgColor: "success",
      textColor: "white",
      labelStyle: "fw-bold text-white bg-success bg-opacity-75 px-2 py-1 rounded",
      data: earningsData,
      type: "earnings"
    },
    { 
      label: "Total Orders", 
      value: totalOrders,
      bgColor: "primary",
      textColor: "white",
      labelStyle: "fw-bold text-white bg-primary bg-opacity-75 px-2 py-1 rounded",
      data: ordersData,
      type: "orders"
    },
    { 
      label: "Total Items", 
      value: totalItems,
      bgColor: "warning",
      textColor: "dark",
      labelStyle: "fw-bold text-dark bg-warning bg-opacity-75 px-2 py-1 rounded",
      data: menuItemsData,
      type: "items"
    },
    { 
      label: "Current Orders", 
      value: currentOrders,
      bgColor: "info",
      textColor: "white",
      labelStyle: "fw-bold text-white bg-info bg-opacity-75 px-2 py-1 rounded",
      data: currentOrdersData,
      type: "current-orders"
    }
  ];

  const renderModalContent = () => {
    if (!modalContent) return null;

    switch (modalContent.type) {
      case "earnings":
        return (
          <>
            <Modal.Header closeButton className="bg-success text-white">
              <Modal.Title> Earnings Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Recent Transactions</h6>
                <Badge bg="success" className="fs-6">Total: ₹{totalEarnings}</Badge>
              </div>
              {modalContent.data.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order ID</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalContent.data.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td className="fw-bold">{item.orderId}</td>
                        <td><small>{item.items}</small></td>
                        <td className="fw-bold text-success">{item.amount}</td>
                        <td>
                          <Badge bg="success">{item.type}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-4">
                  <h5>No earnings data yet</h5>
                  <p>Complete some orders to see earnings here</p>
                </div>
              )}
            </Modal.Body>
          </>
        );

      case "orders":
        return (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title> Orders History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">All Orders</h6>
                <Badge bg="primary" className="fs-6">Total: {totalOrders}</Badge>
              </div>
              {modalContent.data.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalContent.data.map((order, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{order.id}</td>
                          <td>{order.customer}</td>
                          <td>
                            <Badge bg="secondary">{order.items} items</Badge>
                          </td>
                          <td className="fw-bold text-success">{order.amount}</td>
                          <td>
                            <Badge bg={
                              order.status === 'Completed' ? 'success' :
                              order.status === 'Preparing' ? 'warning' : 
                              order.status === 'Ready' ? 'info' : 'secondary'
                            }>
                              {order.status}
                            </Badge>
                          </td>
                          <td><small>{order.timestamp}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <h5>No orders yet</h5>
                  <p>Create some orders to see them here</p>
                </div>
              )}
            </Modal.Body>
          </>
        );

      case "items":
        return (
          <>
            <Modal.Header closeButton className="bg-warning text-dark">
              <Modal.Title> Menu Items</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Available Menu Items</h6>
                <Badge bg="warning" className="fs-6">Total: {totalItems}</Badge>
              </div>
              {modalContent.data.length > 0 ? (
                <div className="row">
                  {modalContent.data.map((item) => (
                    <div key={item.id} className="col-md-6 mb-3">
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="card-title text-primary mb-1">{item.name}</h6>
                              <Badge bg="secondary" className="me-2">{item.category}</Badge>
                              <Badge bg={item.status === 'Available' ? 'success' : 'danger'}>
                                {item.status}
                              </Badge>
                            </div>
                            <h5 className="text-success mb-0">{item.price}</h5>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              Ordered {item.orders} times
                            </small>
                            {item.orders > 0 && (
                              <Badge bg="info">Popular</Badge>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <h5>No menu items yet</h5>
                  <p>Add some products to see them here</p>
                </div>
              )}
            </Modal.Body>
          </>
        );

      case "current-orders":
        return (
          <>
            <Modal.Header closeButton className="bg-info text-white">
              <Modal.Title> Current Orders</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Active Orders in Kitchen</h6>
                <Badge bg="info" className="fs-6">Total: {currentOrders}</Badge>
              </div>
              {modalContent.data.length > 0 ? (
                <ListGroup variant="flush">
                  {modalContent.data.map((order, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{order.id}</strong>
                          <br />
                          <small className="text-muted">Customer: {order.customer}</small>
                          <br />
                          <small>{order.items}</small>
                        </div>
                        <div className="text-end">
                          <Badge bg={
                            order.status === 'Ready' ? 'success' :
                            order.status === 'Preparing' ? 'warning' : 'info'
                          }>
                            {order.status}
                          </Badge>
                          <br />
                          <small className="text-muted">{order.time}</small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">
                  <h5>No active orders</h5>
                  <p>All orders are completed or no orders created yet</p>
                </div>
              )}
            </Modal.Body>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2> RESTAURANT</h2>
            <p className="text-muted">AJA Restaurant - Updates automatically (Items or Orders)</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4">
          {statsConfig.map((stat) => (
            <div className="col-xl-3 col-md-6" key={stat.label}>
              <div 
                className={`card shadow-lg border-0 h-100 bg-${stat.bgColor} text-${stat.textColor} clickable-card`}
                onClick={() => handleCardClick(stat)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body text-center p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-1">
                      {stat.type === 'earnings' ? '' : 
                       stat.type === 'orders' ? '' : 
                       stat.type === 'items' ? '' : ''}
                    </span>
                    <span className={`badge ${stat.labelStyle} fs-6`}>
                      {stat.label}
                    </span>
                  </div>
                  <h2 className="card-text fw-bold display-6 mb-0">{stat.value}</h2>
                  <div className="mt-3">
                    <small className="opacity-75">Live Updates</small>
                  </div>
                </div>
                <div className={`card-footer bg-${stat.bgColor} bg-opacity-50 border-0 text-center py-2`}>
                  <small className={`text-${stat.textColor} opacity-75`}>
                    Click to view details →
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Summary */}
        <div className="row mt-5">
          <div className="col-12">
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Activity</h5>
              </Card.Header>
              <Card.Body>
                <div className="row text-center">
                  <div className="col-md-2">
                    <div className="border-end">
                      <h4 className="text-success">{products.filter(p => p.available).length}</h4>
                      <p className="text-muted mb-0">Available Items</p>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="border-end">
                      <h4 className="text-warning">{products.filter(p => !p.available).length}</h4>
                      <p className="text-muted mb-0">Out of Stock</p>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="border-end">
                      <h4 className="text-primary">{orders.filter(o => o.status === 'Completed').length}</h4>
                      <p className="text-muted mb-0">Completed Orders</p>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="border-end">
                      <h4 className="text-info">{orders.filter(o => o.status === 'Preparing').length}</h4>
                      <p className="text-muted mb-0">Preparing</p>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="border-end">
                      <h4 className="text-success">{orders.filter(o => o.status === 'Ready').length}</h4>
                      <p className="text-muted mb-0">Ready</p>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <h4 className="text-secondary">{orders.filter(o => o.status === 'Pending').length}</h4>
                    <p className="text-muted mb-0">Pending</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        {renderModalContent()}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;