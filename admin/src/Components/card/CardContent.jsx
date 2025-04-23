const CardContent = ({ children, className = "" }) => {
    return <div className={`card-content ${className}`}>{children}</div>;
  };
  
  export default CardContent;