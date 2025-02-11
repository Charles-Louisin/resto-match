'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './menu.module.css';

export default function MenuForm({ onSubmit, initialData, isEditing }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Plats',
    image: '',
    available: true
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Entrées', 'Plats', 'Desserts', 'Boissons'];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewImage(initialData.image);
    }
  }, [initialData]);

  const compressImage = (base64String, maxWidth = 800) => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(base64String);
        return;
      }

      const img = new window.Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculer les nouvelles dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.floor(height * (maxWidth / width));
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Convertir en JPEG avec compression plus agressive
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          // Vérifier la taille de l'image compressée
          const sizeInMB = (compressedBase64.length * 0.75) / (1024 * 1024);
          console.log(`Taille de l'image compressée: ${sizeInMB.toFixed(2)} MB`);
          
          if (sizeInMB > 10) {
            // Si l'image est toujours trop grande, compresser davantage
            const furtherCompressed = canvas.toDataURL('image/jpeg', 0.3);
            resolve(furtherCompressed);
          } else {
            resolve(compressedBase64);
          }
        } catch (error) {
          console.error('Erreur lors de la compression:', error);
          // En cas d'erreur, essayer une compression plus agressive
          try {
            const fallbackCompressed = canvas.toDataURL('image/jpeg', 0.3);
            resolve(fallbackCompressed);
          } catch (fallbackError) {
            console.error('Erreur lors de la compression de secours:', fallbackError);
            resolve(base64String);
          }
        }
      };

      img.onerror = () => {
        console.error('Erreur lors du chargement de l\'image');
        resolve(base64String);
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressedImage = await compressImage(reader.result);
          setPreviewImage(compressedImage);
          setFormData(prev => ({ ...prev, image: compressedImage }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        alert('Erreur lors du traitement de l\'image. Veuillez réessayer avec une autre image.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validation des données
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      if (!formData.image && !isEditing) {
        throw new Error('Veuillez sélectionner une image');
      }

      // Vérification du prix
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Le prix doit être un nombre positif');
      }

      // Formatage des données avant envoi
      const submissionData = {
        ...formData,
        price: price,
        available: formData.available === undefined ? true : formData.available
      };

      // Log des données avant envoi
      console.log('Données du formulaire avant envoi:', submissionData);

      await onSubmit(submissionData);
      
      if (!isEditing) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Plats',
          image: '',
          available: true
        });
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('Erreur dans le formulaire:', error);
      alert(error.message || 'Une erreur est survenue lors de la soumission du formulaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>{isEditing ? 'Modifier l\'élément' : 'Ajouter un nouvel élément'}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formLeft}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className={styles.textarea}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price">Prix (XAF)</label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={styles.select}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className={styles.formRight}>
            <div className={styles.formGroup}>
              <label htmlFor="image" className={styles.fileInputLabel}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                  <line x1="16" y1="5" x2="22" y2="5" />
                  <line x1="19" y1="2" x2="19" y2="8" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span>
                  {previewImage ? 'Changer l\'image' : 'Sélectionner une image'}
                </span>
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
                required={!isEditing}
              />
              {previewImage && (
                <div className={styles.imagePreview}>
                  <Image
                    src={previewImage}
                    alt="Prévisualisation"
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                  className={styles.checkbox}
                />
                Disponible
              </label>
            </div>
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (isEditing ? 'Modification...' : 'Ajout...') : (isEditing ? 'Modifier' : 'Ajouter au menu')}
          </button>
          {isEditing && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => onSubmit(null)}
              disabled={loading}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
