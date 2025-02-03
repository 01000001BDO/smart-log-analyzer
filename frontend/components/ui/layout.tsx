interface LayoutProps {
    children: React.ReactNode;
}
   
export const Layout: React.FC<LayoutProps> = ({ children }) => (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
);