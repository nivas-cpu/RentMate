const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-primary-50 text-primary-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-surface-100 text-surface-600',
  };
  return (
    <span className={`badge ${colors[color]}`}>
      {children}
    </span>
  );
};

export default Badge;
