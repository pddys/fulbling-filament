import styles from './style.module.css';

export const Card = ({ title, description }: { title: string; description: string }) => (
  <div className={styles.card}>
    <h3>{title}</h3>
    <p>{description}</p>
    <button>Info & Tickets</button>
  </div>
);