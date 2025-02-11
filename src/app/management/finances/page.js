'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import styles from './finances.module.css';
import Navbar from '../../../components/Navbar';

export default function FinancialManagement() {
  const [timeframe, setTimeframe] = useState('week');
  const [revenueData, setRevenueData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    revenue: {
      total: 0,
      growth: 0
    },
    expenses: {
      total: 0,
      breakdown: {
        inventory: 0,
        salary: 0,
        utilities: 0,
        maintenance: 0,
        other: 0
      }
    },
    profit: {
      total: 0,
      margin: 0
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchFinancialData();
  }, [timeframe]);

  const fetchFinancialData = async () => {
    try {
      const [statsRes, revenueRes, expensesRes, categoryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/management/finances/stats?timeframe=${timeframe}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/management/finances/revenue?timeframe=${timeframe}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/management/finances/expenses?timeframe=${timeframe}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/management/finances/categories?timeframe=${timeframe}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        })
      ]);

      const [stats, revenue, expenses, categories] = await Promise.all([
        statsRes.json(),
        revenueRes.json(),
        expensesRes.json(),
        categoryRes.json()
      ]);

      setFinancialStats(stats);
      setRevenueData(revenue);
      setExpensesData(expenses);
      setCategoryData(categories);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Gestion Financière</h1>

        <div className={styles.timeframeSelector}>
          <button
            className={`${styles.timeframeButton} ${timeframe === 'week' ? styles.active : ''}`}
            onClick={() => setTimeframe('week')}
          >
            Semaine
          </button>
          <button
            className={`${styles.timeframeButton} ${timeframe === 'month' ? styles.active : ''}`}
            onClick={() => setTimeframe('month')}
          >
            Mois
          </button>
          <button
            className={`${styles.timeframeButton} ${timeframe === 'year' ? styles.active : ''}`}
            onClick={() => setTimeframe('year')}
          >
            Année
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <h2>Revenus</h2>
            <div className={styles.statValue}>
              {formatCurrency(financialStats.revenue.total)}
              <span className={`${styles.growth} ${
                financialStats.revenue.growth >= 0 ? styles.positive : styles.negative
              }`}>
                {financialStats.revenue.growth >= 0 ? '+' : ''}
                {financialStats.revenue.growth}%
              </span>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h2>Dépenses</h2>
            <div className={styles.statValue}>
              {formatCurrency(financialStats.expenses.total)}
            </div>
          </div>

          <div className={styles.statsCard}>
            <h2>Bénéfices</h2>
            <div className={styles.statValue}>
              {formatCurrency(financialStats.profit.total)}
              <span className={styles.margin}>
                Marge: {financialStats.profit.margin}%
              </span>
            </div>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h2>Revenus vs Dépenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{
                    color: '#4a5568',
                    fontWeight: 500,
                    marginBottom: '0.25rem'
                  }}
                  itemStyle={{
                    color: '#2d3748',
                    fontWeight: 600
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4299e1" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#f56565" name="Dépenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h2>Répartition des Dépenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(financialStats.expenses.breakdown).map(([key, value]) => ({
                    name: key,
                    value: value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(financialStats.expenses.breakdown).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h2>Revenus par Catégorie</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#4299e1" name="Revenus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.exportSection}>
          <h2>Exporter les Rapports</h2>
          <div className={styles.exportButtons}>
            <button className={styles.exportButton} onClick={() => window.print()}>
              Imprimer le Rapport
            </button>
            <button className={styles.exportButton}>
              Exporter en PDF
            </button>
            <button className={styles.exportButton}>
              Exporter en Excel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
