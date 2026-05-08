import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, count, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? '#f90' : 'transparent'}
          color={star <= Math.round(rating) ? '#f90' : '#ddd'}
        />
      ))}
      {count !== undefined && (
        <span style={{ fontSize: '12px', color: '#007bff', marginLeft: '4px' }}>
          ({count.toLocaleString()})
        </span>
      )}
    </span>
  );
}
