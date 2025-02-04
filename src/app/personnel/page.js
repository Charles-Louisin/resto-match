'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import styles from './personnel.module.css';

export default function Personnel() {
  const { user } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (!user || !['staff', 'admin'].includes(user.role)) {
      router.push('/');
      return;
    }
    fetchReservations();
  }, [user, router]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'GET',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }

      const data = await response.json();
      setReservations(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Une erreur est survenue lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      setReservations(reservations.map(reservation => 
        reservation._id === reservationId 
          ? { ...reservation, status: newStatus }
          : reservation
      ));
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const filteredReservations = reservations
    .filter(reservation => {
      const statusMatch = selectedStatus === 'all' || reservation.status === selectedStatus;
      const typeMatch = selectedType === 'all' || reservation.type === selectedType;
      return statusMatch && typeMatch;
    })
    .sort((a, b) => {
      // Trier par date (plus récent en premier)
      return new Date(b.date) - new Date(a.date);
    });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>
            Chargement des réservations...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestion des Réservations</h1>
          <p>Gérez toutes les réservations du restaurant</p>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Statut :</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Type :</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Tous les types</option>
                <option value="surPlace">Sur place</option>
                <option value="livraison">Livraison</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.reservationsGrid}>
          {filteredReservations.length === 0 ? (
            <div className={styles.noReservations}>
              Aucune réservation ne correspond aux critères sélectionnés
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div key={reservation._id} className={styles.reservationCard}>
                <div className={styles.cardHeader}>
                  <h3>{reservation.customerName}</h3>
                  <span className={`${styles.status} ${getStatusColor(reservation.status)}`}>
                    {getStatusLabel(reservation.status)}
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Date :</span>
                    <span>{formatDate(reservation.date)} à {reservation.time}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Type :</span>
                    <span>{reservation.type === 'surPlace' ? 'Sur place' : 'Livraison'}</span>
                  </div>
                  {reservation.type === 'surPlace' ? (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Personnes :</span>
                      <span>{reservation.numberOfPeople}</span>
                    </div>
                  ) : (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Adresse :</span>
                      <span>{reservation.address}</span>
                    </div>
                  )}
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Contact :</span>
                    <div className={styles.contactInfo}>
                      <div>{reservation.email}</div>
                      <div>{reservation.phone}</div>
                    </div>
                  </div>
                  {reservation.dishes && reservation.dishes.length > 0 && (
                    <div className={styles.dishesSection}>
                      <span className={styles.label}>Plats commandés :</span>
                      <div className={styles.dishesList}>
                        {reservation.dishes.map((dish, index) => (
                          <div key={index} className={styles.dishItem}>
                            <span>{dish.quantity}x {dish.name}</span>
                            <span>{dish.price.toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.totalAmount}>
                        <span className={styles.label}>Total :</span>
                        <span>{reservation.totalAmount.toFixed(2)}€</span>
                      </div>
                    </div>
                  )}
                  {reservation.specialRequests && (
                    <div className={styles.specialRequests}>
                      <span className={styles.label}>Demandes spéciales :</span>
                      <pre className={styles.requestsText}>{reservation.specialRequests}</pre>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(reservation._id, 'confirmed')}
                        className={styles.confirmButton}
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => handleStatusChange(reservation._id, 'cancelled')}
                        className={styles.cancelButton}
                      >
                        Annuler
                      </button>
                    </>
                  )}
                  {reservation.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(reservation._id, 'cancelled')}
                      className={styles.cancelButton}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
