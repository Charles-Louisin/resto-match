'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './menu.module.css';
import Navbar from '../../components/Navbar';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const categories = ['Tous', 'Entrées', 'Plats', 'Desserts', 'Boissons'];

  useEffect(() => {
    fetchMenuItems();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/menu');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du menu');
      }
      const data = await response.json();
      setMenuItems(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Une erreur est survenue lors du chargement du menu');
    } finally {
      setLoading(false);
    }
  };

  const isItemInCart = (itemId) => {
    return cartItems.some(item => item._id === itemId);
  };

  const addToCart = (item) => {
    if (isItemInCart(item._id)) return;

    const updatedCart = [...cartItems, { ...item, quantity: 1 }];
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Émettre un événement pour mettre à jour le badge du panier
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Afficher la notification
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  const cartTotal = cartItems.length;

  const filteredItems = selectedCategory === 'Tous'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>
            Chargement du menu...
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
        {cartTotal > 0 && (
          <Link href="/panier" className={styles.cartBadge}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.cartIcon} viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className={styles.cartCount}>{cartTotal}</span>
          </Link>
        )}

        {showCartNotification && (
          <div className={styles.notification}>
            Plat ajouté au panier !
          </div>
        )}

        <div className={styles.menuContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Notre Menu</h1>
            <p className={styles.description}>
              Découvrez notre sélection de plats préparés avec soin par nos chefs talentueux
            </p>
          </div>

          <div className={styles.categories}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className={styles.menuGrid}>
            {filteredItems.map(item => (
              <div key={item._id} className={styles.menuItem}>
                <div className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={styles.menuImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>
                      {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <div className={styles.itemFooter}>
                    <div className={styles.dietaryInfo}>
                      {item.isVegetarian && (
                        <span className={styles.dietaryTag}>Végétarien</span>
                      )}
                      {item.isVegan && (
                        <span className={styles.dietaryTag}>Vegan</span>
                      )}
                      {item.isGlutenFree && (
                        <span className={styles.dietaryTag}>Sans Gluten</span>
                      )}
                    </div>
                    <button 
                      className={`${styles.addButton} ${isItemInCart(item._id) ? styles.added : ''}`}
                      onClick={() => addToCart(item)}
                      disabled={isItemInCart(item._id)}
                    >
                      {isItemInCart(item._id) ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Ajouté
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Ajouter au panier
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
