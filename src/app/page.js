import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Bienvenue chez Resto-Match</h1>
            <p className={styles.description}>
              Une expérience culinaire unique au cœur de la ville
            </p>
            <div className={styles.cta}>
              <Link href="/reservation" className={styles.button}>
                Réserver une table
              </Link>
              <Link href="/menu" className={styles.buttonOutline}>
                Voir le menu
              </Link>
            </div>
          </div>

          <section className={styles.features}>
            <div className={styles.feature}>
              <Image
                src="/icons/reservation.svg"
                alt="Réservation"
                width={64}
                height={64}
                priority
              />
              <h3>Réservation Simple</h3>
              <p>Réservez votre table en quelques clics</p>
            </div>
            <div className={styles.feature}>
              <Image
                src="/icons/menu.svg"
                alt="Menu"
                width={64}
                height={64}
              />
              <h3>Menu Varié</h3>
              <p>Découvrez nos plats raffinés</p>
            </div>
            <div className={styles.feature}>
              <Image
                src="/icons/delivery.svg"
                alt="Livraison"
                width={64}
                height={64}
              />
              <h3>Commande en Ligne</h3>
              <p>Profitez de nos plats chez vous</p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
