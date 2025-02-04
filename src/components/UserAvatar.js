'use client';

import styles from './UserAvatar.module.css';

export default function UserAvatar({ name, onClick, title }) {
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button 
      className={styles.avatar}
      onClick={onClick}
      title={title || name}
    >
      {getInitials(name)}
    </button>
  );
}
