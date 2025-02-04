'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reservations/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchReservations();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    if (filter === 'surPlace') return reservation.type === 'surPlace';
    if (filter === 'livraison') return reservation.type === 'livraison';
    return reservation.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FCD34D',
      confirmed: '#34D399',
      rejected: '#EF4444',
      delivered: '#60A5FA',
      completed: '#8B5CF6'
    };
    return colors[status] || '#CBD5E0';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tableau de Bord</h1>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'surPlace' ? styles.active : ''}`}
            onClick={() => setFilter('surPlace')}
          >
            Sur Place
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'livraison' ? styles.active : ''}`}
            onClick={() => setFilter('livraison')}
          >
            Livraisons
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            En Attente
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Réservations</h3>
          <p>{reservations.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>En Attente</h3>
          <p>{reservations.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Sur Place</h3>
          <p>{reservations.filter(r => r.type === 'surPlace').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Livraisons</h3>
          <p>{reservations.filter(r => r.type === 'livraison').length}</p>
        </div>
      </div>

      <div className={styles.reservationsGrid}>
        {filteredReservations.map(reservation => (
          <div key={reservation._id} className={styles.reservationCard}>
            <div className={styles.cardHeader}>
              <div className={styles.customerInfo}>
                <h3>{reservation.name}</h3>
                <p>{reservation.email}</p>
                <p>{reservation.phone}</p>
              </div>
              <div 
                className={styles.status}
                style={{ backgroundColor: getStatusColor(reservation.status) }}
              >
                {reservation.status}
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.reservationDetails}>
                <p><strong>Type:</strong> {reservation.type === 'surPlace' ? 'Sur place' : 'Livraison'}</p>
                <p><strong>Date:</strong> {formatDate(reservation.date)}</p>
                {reservation.type === 'surPlace' ? (
                  <p><strong>Personnes:</strong> {reservation.numberOfPeople}</p>
                ) : (
                  <p><strong>Adresse:</strong> {reservation.address}</p>
                )}
                {reservation.specialRequests && (
                  <p><strong>Demandes spéciales:</strong> {reservation.specialRequests}</p>
                )}
              </div>

              {reservation.dishes && reservation.dishes.length > 0 && (
                <div className={styles.dishes}>
                  <h4>Commande:</h4>
                  <ul>
                    {reservation.dishes.map((dish, index) => (
                      <li key={index}>
                        {dish.name} x{dish.quantity} - {(dish.price * dish.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.total}>
                    Total: {reservation.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.cardActions}>
              {reservation.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus(reservation._id, 'confirmed')}
                    className={styles.confirmButton}
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => updateStatus(reservation._id, 'rejected')}
                    className={styles.rejectButton}
                  >
                    Rejeter
                  </button>
                </>
              )}
              {reservation.status === 'confirmed' && reservation.type === 'livraison' && (
                <button
                  onClick={() => updateStatus(reservation._id, 'delivered')}
                  className={styles.deliverButton}
                >
                  Marquer comme livré
                </button>
              )}
              {reservation.status === 'confirmed' && reservation.type === 'surPlace' && (
                <button
                  onClick={() => updateStatus(reservation._id, 'completed')}
                  className={styles.completeButton}
                >
                  Marquer comme terminé
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
