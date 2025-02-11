'use client';

import { useState, useEffect } from 'react';
import styles from './menu.module.css';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import ImageDropzone from './ImageDropzone';

export default function StaffMenu() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const categories = {
    'Entrées': 'Entrées',
    'Plats': 'Plats',
    'Desserts': 'Desserts',
    'Boissons': 'Boissons'
  };
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
  });
  const [editingDish, setEditingDish] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
  });
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMenuItems();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du menu');
      }

      const data = await response.json();
      setMenuItems(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération du menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (item) => {
    if (!item) return;
    
    setEditingDish({
      name: item.name || '',
      description: item.description || '',
      price: item.price ? item.price.toString() : '0',
      category: item.category || '',
      image: item.image || '',
    });
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setNewDish({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
    });
    setEditingDish({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
    });
    setCurrentItem(null);
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      if (!newDish.name || !newDish.description || !newDish.price || !newDish.category) {
        throw new Error('Données du formulaire manquantes');
      }

      // Vérifier la taille de l'image
      let imageToSend = newDish.image;
      if (imageToSend && imageToSend.length > 1024 * 1024) {
        imageToSend = await compressImage(imageToSend);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          name: newDish.name,
          description: newDish.description,
          price: parseFloat(newDish.price),
          category: newDish.category,
          image: imageToSend,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }

      await fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue lors de la sauvegarde');
    }
  };

  const handleEditDish = async (e) => {
    e.preventDefault();
    try {
      if (!editingDish.name || !editingDish.description || !editingDish.price || !editingDish.category) {
        throw new Error('Données du formulaire manquantes');
      }

      // Vérifier la taille de l'image
      let imageToSend = editingDish.image;
      if (imageToSend && imageToSend.length > 1024 * 1024) {
        imageToSend = await compressImage(imageToSend);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${currentItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          name: editingDish.name,
          description: editingDish.description,
          price: parseFloat(editingDish.price),
          category: editingDish.category,
          image: imageToSend,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }

      await fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        await fetchMenuItems();
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Fonction pour compresser l'image
  const compressImage = (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculer les nouvelles dimensions
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64String;
    });
  };

  if (!user || !['staff', 'admin'].includes(user.role)) {
    return (
      <div className={styles.unauthorized}>
        <h1>Accès non autorisé</h1>
        <p>Vous devez être connecté en tant que personnel pour accéder à cette page.</p>
      </div>
    );
  }

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.categoryButtons}>
            <button
              className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tous
            </button>
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <button className={styles.addButton} onClick={handleAddClick}>
            <span>+</span> Ajouter un plat
          </button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Chargement...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.menuGrid}>
        {filteredItems.map((item) => (
          <div key={item._id} className={styles.menuItem}>
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className={styles.menuImage}
              />
            )}
            <div className={styles.menuInfo}>
              <h3>{item.name}</h3>
              <p className={styles.menuPrice}>{item.price} €</p>
              <p className={styles.menuDescription}>{item.description}</p>
              <div className={styles.menuCategory}>{item.category}</div>
              {!item.available && (
                <div className={styles.unavailableBadge}>Non disponible</div>
              )}
              <div className={styles.menuActions}>
                <button
                  onClick={() => handleEditClick(item)}
                  className={styles.editButton}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className={styles.deleteButton}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <>
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ajouter un plat</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddModal(false)}
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleAddDish}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Nom du plat</label>
                  <input
                    type="text"
                    id="name"
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newDish.description}
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="price">Prix (€)</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Catégorie</label>
                  <select
                    id="category"
                    value={newDish.category}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {Object.entries(categories).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="image">Photo du plat</label>
                  <ImageDropzone
                    onImageChange={(imageData) => setNewDish({ ...newDish, image: imageData })}
                    currentImage={newDish.image}
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showEditModal && (
        <>
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Modifier le plat</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowEditModal(false)}
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleEditDish}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-name">Nom du plat</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editingDish.name}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    value={editingDish.description}
                    onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-price">Prix (€)</label>
                  <input
                    type="number"
                    id="edit-price"
                    step="0.01"
                    min="0"
                    value={editingDish.price}
                    onChange={(e) => setEditingDish({ ...editingDish, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-category">Catégorie</label>
                  <select
                    id="edit-category"
                    value={editingDish.category}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {Object.entries(categories).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-image">Photo du plat</label>
                  <ImageDropzone
                    onImageChange={(imageData) => setEditingDish({ ...editingDish, image: imageData })}
                    currentImage={editingDish.image}
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowEditModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
