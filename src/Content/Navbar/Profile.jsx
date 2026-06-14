import { useState } from "react";

const Profile = ({ image }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="profile">
      {image && !imgError ? (
        <img 
          src={image} 
          alt="User avatar" 
          className="w-full h-full rounded-full object-cover shadow-sm"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#1e293b" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )}
    </div>
  )
}

export default Profile