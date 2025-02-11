'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from './reservations.module.css';

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/all`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${id}/status`, {
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
    return <div>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Gestion des Réservations</h1>
      
      <div className={styles.reservationsGrid}>
        {reservations.map(reservation => (
          <div key={reservation._id} className={styles.reservationCard}>
            <div className={styles.header}>
              <h3>{reservation.name}</h3>
              <span className={`${styles.status} ${styles[reservation.status]}`}>
                {reservation.status}
              </span>
            </div>

            <div className={styles.details}>
              <p><strong>Type:</strong> {reservation.type === 'surPlace' ? 'Sur place' : 'Livraison'}</p>
              <p><strong>Date:</strong> {reservation.date}</p>
              <p><strong>Heure:</strong> {reservation.time}</p>
              {reservation.type === 'surPlace' ? (
                <p><strong>Nombre de personnes:</strong> {reservation.numberOfPeople}</p>
              ) : (
                <p><strong>Adresse:</strong> {reservation.address}</p>
              )}
              <p><strong>Contact:</strong> {reservation.phone}</p>
              <p><strong>Email:</strong> {reservation.email}</p>
              {reservation.specialRequests && (
                <p><strong>Demandes spéciales:</strong> {reservation.specialRequests}</p>
              )}
            </div>

            {reservation.dishes && reservation.dishes.length > 0 && (
              <div className={styles.dishes}>
                <h4>Plats commandés:</h4>
                <ul>
                  {reservation.dishes.map(dish => (
                    <li key={dish._id}>
                      {dish.name} x{dish.quantity} - {(dish.price * dish.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </li>
                  ))}
                </ul>
                <p className={styles.total}>
                  <strong>Total:</strong> {reservation.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            )}

            <div className={styles.actions}>
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
