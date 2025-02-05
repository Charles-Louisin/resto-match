'use client';

import { useState, useEffect } from 'react';
import styles from './staff.module.css';
import Navbar from '../../../components/Navbar';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'server',
    phone: '',
    startDate: '',
    schedule: 'full-time'
  });

  const roles = ['server', 'chef', 'manager', 'host', 'bartender'];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/management/staff', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/management/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(newEmployee)
      });

      if (response.ok) {
        setNewEmployee({
          name: '',
          email: '',
          role: 'server',
          phone: '',
          startDate: '',
          schedule: 'full-time'
        });
        fetchStaff();
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/management/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/management/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const filteredStaff = staff.filter(employee => 
    selectedRole === 'all' ? true : employee.role === selectedRole
  );

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Gestion du Personnel</h1>

        <div className={styles.addEmployeeSection}>
          <h2>Ajouter un Nouvel Employé</h2>
          <form onSubmit={handleNewEmployeeSubmit} className={styles.addEmployeeForm}>
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
              <label htmlFor="role">Rôle</label>
              <select
                id="role"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
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
              <label htmlFor="startDate">Date de début</label>
              <input
                type="date"
                id="startDate"
                value={newEmployee.startDate}
                onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="schedule">Type de contrat</label>
              <select
                id="schedule"
                value={newEmployee.schedule}
                onChange={(e) => setNewEmployee({ ...newEmployee, schedule: e.target.value })}
              >
                <option value="full-time">Temps plein</option>
                <option value="part-time">Temps partiel</option>
                <option value="seasonal">Saisonnier</option>
              </select>
            </div>
            <button type="submit" className={styles.submitButton}>
              Ajouter l'employé
            </button>
          </form>
        </div>

        <div className={styles.staffSection}>
          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${selectedRole === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedRole('all')}
            >
              Tous
            </button>
            {roles.map((role) => (
              <button
                key={role}
                className={`${styles.filterButton} ${selectedRole === role ? styles.active : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>Chargement du personnel...</div>
          ) : (
            <div className={styles.staffGrid}>
              {filteredStaff.map((employee) => (
                <div key={employee._id} className={styles.employeeCard}>
                  <div className={styles.employeeHeader}>
                    <h3>{employee.name}</h3>
                    <span className={styles.role}>{employee.role}</span>
                  </div>
                  <div className={styles.employeeInfo}>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Téléphone:</strong> {employee.phone}</p>
                    <p><strong>Date de début:</strong> {new Date(employee.startDate).toLocaleDateString()}</p>
                    <p><strong>Type de contrat:</strong> {employee.schedule}</p>
                  </div>
                  <div className={styles.employeeActions}>
                    <button
                      onClick={() => handleUpdateEmployee(employee._id, { active: !employee.active })}
                      className={`${styles.statusButton} ${employee.active ? styles.active : ''}`}
                    >
                      {employee.active ? 'Actif' : 'Inactif'}
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee._id)}
                      className={styles.deleteButton}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
