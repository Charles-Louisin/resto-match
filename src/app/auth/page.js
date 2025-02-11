'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'client'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        console.log('Réponse du serveur:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Erreur de connexion');
        }

        // Stocker le token et l'utilisateur
        const userData = {
          ...data.user,
          token: data.token
        };
        login(userData);
        
        // Vérifier s'il y a une réservation en attente
        const pendingReservation = localStorage.getItem('pendingReservation');
        if (pendingReservation) {
          router.push('/reservation');
        } else {
          // Redirection vers la page d'accueil si pas de réservation en attente
          router.push('/');
        }
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            role: 'client' // Forcer le rôle client pour l'inscription
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage('Compte créé avec succès !');
          setIsLogin(true);
          // Réinitialiser le formulaire après l'inscription
          setFormData({
            email: '',
            password: '',
            name: '',
            role: 'client'
          });
        } else {
          throw new Error(data.message || 'Une erreur est survenue');
        }
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'client'
    });
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Retour
      </Link>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Connectez-vous pour accéder à votre compte'
              : 'Inscrivez-vous pour profiter de nos services de réservation'}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Entrez votre nom"
                disabled={isLoading}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Entrez votre email"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              isLogin ? 'Se connecter' : "S'inscrire"
            )}
          </button>
        </form>

        <div className={styles.switchMode}>
          <p>
            {isLogin ? "Vous n'avez pas de compte ?" : 'Déjà inscrit ?'}
            <button
              type="button"
              onClick={handleSwitchMode}
              className={styles.switchButton}
              disabled={isLoading}
            >
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
