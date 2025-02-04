'use client';

import { AuthProvider } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function PersonnelLayout({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      <main>{children}</main>
    </AuthProvider>
  );
}
