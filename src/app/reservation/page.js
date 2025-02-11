'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './reservation.module.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function Reservation() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [reservationType, setReservationType] = useState('surPlace');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    numberOfPeople: 1,
    address: '',
    specialRequests: '',
    name: '',
    email: '',
    phone: ''
  });

  const DELIVERY_FEE = 5.00;
  const TABLE_FEE = 2.00;

  useEffect(() => {
    const dishes = localStorage.getItem('selectedDishes');
    if (dishes) {
      setSelectedDishes(JSON.parse(dishes));
    }
  }, []);

  useEffect(() => {
    // Vérifier s'il y a une réservation en attente après la connexion
    const pendingReservation = localStorage.getItem('pendingReservation');
    if (user && pendingReservation) {
      const { formData: savedFormData, selectedDishes: savedDishes, reservationType: savedType } = JSON.parse(pendingReservation);
      setFormData(savedFormData);
      setSelectedDishes(savedDishes);
      setReservationType(savedType);
      setShowConfirmation(true);
      localStorage.removeItem('pendingReservation');
    }
  }, [user]);

  const calculateSubtotal = () => {
    return selectedDishes.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const fee = reservationType === 'livraison' ? DELIVERY_FEE : TABLE_FEE;
    return subtotal + fee;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      // Sauvegarder les données du formulaire
      localStorage.setItem('pendingReservation', JSON.stringify({
        formData,
        selectedDishes,
        reservationType
      }));
      router.push('/auth');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmReservation = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const reservationData = {
        ...formData,
        type: reservationType,
        dishes: selectedDishes,
        totalAmount: calculateTotal(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: user.id
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la réservation');
      }

      localStorage.removeItem('cart');
      localStorage.removeItem('selectedDishes');
      setShowConfirmation(false);
      setSelectedDishes([]);
      setFormData({
        date: '',
        time: '',
        numberOfPeople: 1,
        address: '',
        specialRequests: '',
        name: '',
        email: '',
        phone: ''
      });
      alert('Votre réservation a été confirmée avec succès !');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la réservation:', error.message);
      alert('Une erreur est survenue lors de la réservation. Veuillez réessayer.');
    }
  };

  const goToMenu = () => {
    router.push('/menu');
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Réservation</h1>
        
        <div className={styles.reservationContent}>
          <form onSubmit={handleSubmit} className={styles.reservationForm}>
            <div className={styles.formGroup}>
              <label>Type de réservation</label>
              <div className={styles.typeButtons}>
                <button
                  type="button"
                  className={`${styles.typeButton} ${reservationType === 'surPlace' ? styles.active : ''}`}
                  onClick={() => setReservationType('surPlace')}
                >
                  Sur place
                </button>
                <button
                  type="button"
                  className={`${styles.typeButton} ${reservationType === 'livraison' ? styles.active : ''}`}
                  onClick={() => setReservationType('livraison')}
                >
                  Livraison
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time">Heure</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>

            {reservationType === 'surPlace' && (
              <div className={styles.formGroup}>
                <label htmlFor="numberOfPeople">Nombre de personnes</label>
                <input
                  type="number"
                  id="numberOfPeople"
                  name="numberOfPeople"
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {reservationType === 'livraison' && (
              <div className={styles.formGroup}>
                <label htmlFor="address">Adresse de livraison</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="specialRequests">Demandes spéciales</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Ex: allergies, préférences particulières..."
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                  Réserver
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setFormData({
                      date: '',
                      time: '',
                      numberOfPeople: 1,
                      address: '',
                      specialRequests: '',
                      name: '',
                      email: '',
                      phone: ''
                    });
                    setSelectedDishes([]);
                    localStorage.removeItem('selectedDishes');
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new Event('cartUpdated'));
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>

          </form>

          <div className={styles.orderSummary}>
            <h2>Résumé de la commande</h2>
            {selectedDishes.length === 0 ? (
              <div className={styles.emptyOrder}>
                <p>Vous n&apos;avez pas encore sélectionné de plats.</p>
                <button onClick={goToMenu} className={styles.menuButton}>
                  Choisir des plats
                </button>
              </div>
            ) : (
              <>
                <div className={styles.selectedDishes}>
                  {selectedDishes.map(dish => (
                    <div key={dish._id} className={styles.dishItem}>
                      <div className={styles.dishInfo}>
                        <span className={styles.dishName}>{dish.name}</span>
                        <span className={styles.dishQuantity}>x{dish.quantity}</span>
                      </div>
                      <span className={styles.dishPrice}>
                        {(dish.price * dish.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryLine}>
                    <span>Sous-total</span>
                    <span>{calculateSubtotal().toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
                  </div>
                  <div className={styles.summaryLine}>
                    <span>{reservationType === 'livraison' ? 'Frais de livraison' : 'Frais de table'}</span>
                    <span>{(reservationType === 'livraison' ? DELIVERY_FEE : TABLE_FEE).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
                  </div>
                  <div className={styles.totalLine}>
                    <span>Total</span>
                    <span>{calculateTotal().toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showConfirmation && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Confirmation de réservation</h2>
              <div className={styles.modalSummary}>
                <div className={styles.reservationDetails}>
                  <h3>Détails de la réservation</h3>
                  <p><strong>Type :</strong> {reservationType === 'surPlace' ? 'Sur place' : 'Livraison'}</p>
                  <p><strong>Date :</strong> {formData.date}</p>
                  <p><strong>Heure :</strong> {formData.time}</p>
                  {reservationType === 'surPlace' ? (
                    <p><strong>Nombre de personnes :</strong> {formData.numberOfPeople}</p>
                  ) : (
                    <p><strong>Adresse :</strong> {formData.address}</p>
                  )}
                  {formData.specialRequests && (
                    <p><strong>Demandes spéciales :</strong> {formData.specialRequests}</p>
                  )}
                </div>

                <div className={styles.modalDishes}>
                  <h3>Plats commandés</h3>
                  {selectedDishes.length > 0 ? (
                    selectedDishes.map(dish => (
                      <div key={dish._id} className={styles.modalDishItem}>
                        <span>{dish.name} x{dish.quantity}</span>
                        <span>{(dish.price * dish.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
                      </div>
                    ))
                  ) : (
                    <p>Aucun plat sélectionné</p>
                  )}
                </div>

                <div className={styles.modalTotal}>
                  <span>Montant total</span>
                  <span>{calculateTotal().toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowConfirmation(false)}
                >
                  Modifier
                </button>
                <button 
                  className={styles.confirmButton}
                  onClick={handleConfirmReservation}
                >
                  Confirmer la réservation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
