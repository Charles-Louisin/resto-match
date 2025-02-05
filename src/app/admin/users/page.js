'use client';

import { useState, useEffect } from 'react';
import styles from './users.module.css';
import Navbar from '../../../components/Navbar';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/orders`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setUserOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    await fetchUserOrders(user._id);
    setShowUserModal(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la modification du rôle');
      }

      window.location.reload();
    } catch (err) {
      console.error(err.message);
    }
  };

  const filteredUsers = selectedRole === 'all'
    ? users
    : users.filter(user => user.role === selectedRole);

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Gestion des Utilisateurs</h1>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${selectedRole === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedRole('all')}
          >
            Tous
          </button>
          <button
            className={`${styles.filterButton} ${selectedRole === 'client' ? styles.active : ''}`}
            onClick={() => setSelectedRole('client')}
          >
            Clients
          </button>
          <button
            className={`${styles.filterButton} ${selectedRole === 'staff' ? styles.active : ''}`}
            onClick={() => setSelectedRole('staff')}
          >
            Staff
          </button>
          <button
            className={`${styles.filterButton} ${selectedRole === 'admin' ? styles.active : ''}`}
            onClick={() => setSelectedRole('admin')}
          >
            Admins
          </button>
        </div>

        <div className={styles.userGrid}>
          {filteredUsers.map((user) => (
            <div key={user._id} className={styles.userCard} onClick={() => handleUserClick(user)}>
              <div className={styles.userInfo}>
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rôle:</strong> {user.role}</p>
                <p><strong>Date d'inscription:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={styles.userActions}>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {showUserModal && selectedUser && (
          <>
            <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)} />
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Détails de l'utilisateur</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowUserModal(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalContent}>
                <div className={styles.userDetails}>
                  <h3>{selectedUser.name}</h3>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Rôle:</strong> {selectedUser.role}</p>
                  <p><strong>Date d'inscription:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  {selectedUser.phone && <p><strong>Téléphone:</strong> {selectedUser.phone}</p>}
                </div>

                <div className={styles.userOrders}>
                  <h3 className={styles.userOrdersTitle}>Commandes de l'utilisateur</h3>
                  {userOrders.length > 0 ? (
                    <div className={styles.ordersList}>
                      {userOrders.map((order) => (
                        <div key={order._id} className={styles.orderCard}>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p><strong>Total:</strong> {order.total}€</p>
                          <p><strong>Status:</strong> {order.status}</p>
                          <div className={styles.orderItems}>
                            {order.items.map((item, index) => (
                              <p key={index}>
                                {item.quantity}x {item.name} - {item.price}€
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Aucune commande trouvée</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
