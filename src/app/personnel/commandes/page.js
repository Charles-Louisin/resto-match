'use client';

import { useState, useEffect } from 'react';
import styles from './commandes.module.css';
import Navbar from '../../../components/Navbar';

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fef3c7',
      preparing: '#e0f2fe',
      ready: '#def7ec',
      delivered: '#f3f4f6',
      cancelled: '#fde8e8'
    };
    return colors[status] || '#f3f4f6';
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Gestion des Commandes</h1>
        
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            En attente
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'preparing' ? styles.active : ''}`}
            onClick={() => setFilter('preparing')}
          >
            En préparation
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'ready' ? styles.active : ''}`}
            onClick={() => setFilter('ready')}
          >
            Prêtes
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'delivered' ? styles.active : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Livrées
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Chargement des commandes...</div>
        ) : (
          <div className={styles.ordersGrid}>
            {filteredOrders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div 
                  className={styles.cardHeader}
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  <h3>Commande #{order._id.slice(-6)}</h3>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.customerInfo}>
                    <p><strong>Client:</strong> {order.user.name}</p>
                    <p><strong>Email:</strong> {order.user.email}</p>
                  </div>
                  <div className={styles.items}>
                    <h4>Articles:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className={styles.item}>
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.total}>
                    <strong>Total:</strong> {order.totalAmount.toFixed(2)} €
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {order.status === 'pending' && (
                    <button
                      className={styles.prepareButton}
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                    >
                      Commencer la préparation
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      className={styles.readyButton}
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                    >
                      Marquer comme prête
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      className={styles.deliverButton}
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                    >
                      Marquer comme livrée
                    </button>
                  )}
                  {['pending', 'preparing'].includes(order.status) && (
                    <button
                      className={styles.cancelButton}
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
