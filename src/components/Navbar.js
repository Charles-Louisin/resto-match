"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Logo/Nom de l'app à gauche */}
        <Link href="/" className={styles.logo}>
          Resto-Match
        </Link>

        {/* Navigation au centre */}
        <div className={styles.navLinks}>
          <Link href="/menu" className={styles.navLink}>
            Menu
          </Link>
          {user && (
            <Link href="/reservation" className={styles.navLink}>
              Réservations
            </Link>
          )}

          {["staff", "admin"].includes(user?.role) && (
            <>
              <Link href="/personnel" className={styles.navLink}>
                Personnel
              </Link>
              <Link href="/personnel/menu" className={styles.navLink}>
                Gestion Menu
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link href="/management" className={styles.navLink}>
              Administration
            </Link>
          )}
          <Link href="/panier" className={styles.cartLink}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.cartIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            {/* Panier */}
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
        </div>

        {/* Authentification à droite */}
        <div className={styles.authSection}>
          {user ? (
            <div className={styles.userSection}>
              <UserAvatar name={user.name} title={user.name} />
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Se déconnecter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
                  <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
                </svg>
              </button>
            </div>
          ) : (
            <Link href="/auth" className={styles.authButton}>
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
