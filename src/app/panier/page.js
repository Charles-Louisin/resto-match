'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './panier.module.css';
import Navbar from '../../components/Navbar';

export default function Panier() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const items = JSON.parse(storedCart);
      setCartItems(items);
      calculateTotal(items);
    }
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => {
      if (item._id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    
    // Émettre un événement pour mettre à jour le badge du panier
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item._id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    
    // Émettre un événement pour mettre à jour le badge du panier
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleReservation = () => {
    localStorage.setItem('selectedDishes', JSON.stringify(cartItems));
    router.push('/reservation');
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.emptyCart}>
            <h2>Votre panier est vide</h2>
            <p>Ajoutez des plats depuis notre menu pour commencer votre commande.</p>
            <button onClick={() => router.push('/menu')} className={styles.returnButton}>
              Retour au menu
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Votre Panier</h1>
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cartItems.map(item => (
              <div key={item._id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <p className={styles.itemPrice}>
                    {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeItem(item._id)}
                    className={styles.removeButton}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cartSummary}>
            <h2>Résumé de la commande</h2>
            <div className={styles.totalAmount}>
              <span>Total</span>
              <span>{total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <button 
              onClick={handleReservation}
              className={styles.reserveButton}
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
