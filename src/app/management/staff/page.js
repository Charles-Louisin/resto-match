'use client';

import { useState, useEffect } from 'react';
import styles from './staff.module.css';
import Navbar from '../../../components/Navbar';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    salary: '',
    phone: '',
    position: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      if (response.ok) {
        setStaff(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération du personnel');
    }
  };

  const handleNewEmployeeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(newEmployee)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'ajout de l\'employé');
      }

      setSuccess('Employé ajouté avec succès');
      setNewEmployee({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        salary: '',
        phone: '',
        position: ''
      });
      fetchStaff();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Gestion du Personnel</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.addEmployeeSection}>
          <h2 className={styles.subtitle}>Ajouter un employé</h2>
          <form onSubmit={handleNewEmployeeSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="salary">Salaire</label>
              <input
                type="number"
                id="salary"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="position">Poste</label>
              <input
                type="text"
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Ajouter l&apos;employé
            </button>
          </form>
        </div>

        <div className={styles.staffList}>
          <h2 className={styles.subtitle}>Liste du Personnel</h2>
          <div className={styles.staffGrid}>
            {staff.map((employee) => (
              <div key={employee._id} className={styles.staffCard}>
                <div className={styles.staffInfo}>
                  <h3>{employee.name}</h3>
                  <p><strong>Email:</strong> {employee.email}</p>
                  <p><strong>Téléphone:</strong> {employee.phone}</p>
                  <p><strong>Poste:</strong> {employee.position}</p>
                  <p><strong>Salaire:</strong> {employee.salary}€</p>
                </div>
                <div className={styles.staffActions}>
                  <button className={styles.editButton}>Modifier</button>
                  <button className={styles.deleteButton}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
