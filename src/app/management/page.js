'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import styles from './management.module.css';
import Navbar from '../../components/Navbar';
// import { toast } from 'react-hot-toast';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  labelStyle: {
    color: '#2d3748',
    marginBottom: '0.5rem'
  }
};

export default function ManagementDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    customers: { total: 0, change: 0 },
    reservations: { total: 0, change: 0 }
  });
  const [revenueData, setRevenueData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!statsResponse.ok) throw new Error('Erreur lors de la récupération des statistiques');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch revenue data
      const revenueResponse = await fetch('http://localhost:5000/api/admin/revenue', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!revenueResponse.ok) throw new Error('Erreur lors de la récupération des revenus');
      const revenueData = await revenueResponse.json();
      setRevenueData(revenueData);

      // Fetch order data
      const orderResponse = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!orderResponse.ok) throw new Error('Erreur lors de la récupération des commandes');
      const orderData = await orderResponse.json();
      setOrderData(orderData);

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.skeleton} style={{ width: '200px', height: '40px' }}></div>
            <div className={styles.statsGrid}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeleton} style={{ height: '150px' }}></div>
              ))}
            </div>
            <div className={styles.chartsSection}>
              {[1, 2].map(i => (
                <div key={i} className={styles.skeleton} style={{ height: '300px' }}></div>
              ))}
            </div>
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
        <h1>Tableau de bord</h1>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Revenus totaux</div>
            <div className={styles.statValue}>{stats.revenue.total}€</div>
            <div className={`${styles.statChange} ${stats.revenue.change >= 0 ? styles.positive : styles.negative}`}>
              {stats.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue.change)}%
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Commandes</div>
            <div className={styles.statValue}>{stats.orders.total}</div>
            <div className={`${styles.statChange} ${stats.orders.change >= 0 ? styles.positive : styles.negative}`}>
              {stats.orders.change >= 0 ? '↑' : '↓'} {Math.abs(stats.orders.change)}%
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Clients</div>
            <div className={styles.statValue}>{stats.customers.total}</div>
            <div className={`${styles.statChange} ${stats.customers.change >= 0 ? styles.positive : styles.negative}`}>
              {stats.customers.change >= 0 ? '↑' : '↓'} {Math.abs(stats.customers.change)}%
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Réservations</div>
            <div className={styles.statValue}>{stats.reservations.total}</div>
            <div className={`${styles.statChange} ${stats.reservations.change >= 0 ? styles.positive : styles.negative}`}>
              {stats.reservations.change >= 0 ? '↑' : '↓'} {Math.abs(stats.reservations.change)}%
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2>Actions rapides</h2>
          <div className={styles.actionButtons}>
            <Link href="/management/users" className={styles.actionButton}>
              Gérer les utilisateurs
            </Link>
            <Link href="/management/menu" className={styles.actionButton}>
              Gérer le menu
            </Link>
            <Link href="/management/reservations" className={styles.actionButton}>
              Voir les réservations
            </Link>
            <Link href="/management/orders" className={styles.actionButton}>
              Voir les commandes
            </Link>
          </div>
        </div>

        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <h2>Revenus des 7 derniers jours</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#48bb78"
                    strokeWidth={2}
                    dot={{ fill: '#48bb78', strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h2>Commandes par catégorie</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Bar 
                    dataKey="orders" 
                    fill="#4299e1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
