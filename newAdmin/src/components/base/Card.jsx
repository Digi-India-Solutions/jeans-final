export default function Card({ children, className = "", title, ...props }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${className}`} {...props}>
      {title && <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>}
      {children}
    </div>
  );
}
