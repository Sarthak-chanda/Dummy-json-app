import { useNavigate } from 'react-router-dom'

const WishlistIcon = ({ count, userdet }) => {
  const navigate = useNavigate()

  return (
    <div className="wishlist-icon nav-icon-wrapper">
      <button 
        type="button" 
        className="nav-icon-btn" 
        onClick={() => {
          if (userdet?.id) {
            navigate(`/${userdet.emailPrefix}/wishlist`)
          } else {
            navigate('/login')
          }
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill={count > 0 ? "#ff4d4f" : "none"}
          stroke={count > 0 ? "#ff4d4f" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        {count > 0 && <span className="nav-icon-badge">{count}</span>}
      </button>
    </div>
  )
}

export default WishlistIcon;
