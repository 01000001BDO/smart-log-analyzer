interface CardProps {
    children: React.ReactNode;
    className?: string;
}
   
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {children}
    </div>
);
   
