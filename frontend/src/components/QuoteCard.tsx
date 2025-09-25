import { type Quote } from '../api';
import './QuoteCard.css';

type Props = {
  quote: Quote;
  onLike: (id: number) => void;
  isActive: boolean;
  isExternalAPI?: boolean;
};

export default function QuoteCard({ quote, onLike, isActive, isExternalAPI = false }: Props) {
  const handleLike = (e: React.MouseEvent) => {
    // To prevent the click from bubbling up to the parent (viewer)
    e.stopPropagation();
    
    if (isExternalAPI) {
      alert('Likes are not available for quotes from the external API');
      return;
    }
    onLike(quote.id);
  };

  const shareMock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create and show toast
    const toast = document.createElement('div');
    toast.textContent = 'This is a mock button';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes if not already present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  return (
    <div className={`quote-card ${isActive ? 'active' : ''}`}>
      <div className="quote-content">
        <div className="quote-text-large">"{quote.text}"</div>
        <div className="quote-meta">
          <span className="author-large">{quote.author_name}</span>
          <span className="dot">·</span>
          <span className="book-large">{quote.book_title}</span>
          {isExternalAPI && <span className="api-badge">External API</span>}
        </div>
      </div>
      <div className="actions">
        <button 
          className={`like ${isExternalAPI ? 'disabled' : ''}`} 
          onClick={handleLike}
          disabled={isExternalAPI}
        >
          ♥ {quote.likes}
        </button>
        <button className="share" onClick={shareMock}>Share</button>
      </div>
    </div>
  );
}