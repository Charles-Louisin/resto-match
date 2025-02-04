'use client';

import { useState, useEffect } from 'react';
import styles from './users.module.css';
import { toast } from 'react-hot-toast';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la modification du rôle');
      }

      toast.success('Rôle mis à jour avec succès');
      fetchUsers(); // Rafraîchir la liste des utilisateurs
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Gestion des Utilisateurs</h1>
      <div className={styles.userList}>
        {users.map(user => (
          <div key={user._id} className={styles.userCard}>
            <div className={styles.userInfo}>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p className={styles.role}>
                Rôle actuel : <span className={styles[user.role]}>{user.role}</span>
              </p>
            </div>
            <div className={styles.actions}>
              {user.role !== 'staff' && (
                <button
                  onClick={() => handleRoleChange(user._id, 'staff')}
                  className={styles.promoteButton}
                  disabled={user.role === 'admin'}
                >
                  Promouvoir en Staff
                </button>
              )}
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleRoleChange(user._id, 'admin')}
                  className={styles.promoteAdminButton}
                >
                  Promouvoir en Admin
                </button>
              )}
              {user.role !== 'client' && (
                <button
                  onClick={() => handleRoleChange(user._id, 'client')}
                  className={styles.demoteButton}
                >
                  Rétrograder en Client
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
