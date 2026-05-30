import { useNavigate } from 'react-router-dom'
import './Profile.css'

const demoUser = {
  name: 'Sarthak Chanda',
  email: 'sarthak@example.com',
  role: 'Frontend Developer',
  location: 'West Bengal, India',
  bio: 'Building clean, fast, and interactive web experiences.',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  stats: [
    { label: 'Projects', value: '12' },
    { label: 'Followers', value: '1.4K' },
    { label: 'Following', value: '248' },
  ],
  recentActivity: [
    'Updated login system UI',
    'Published a new project showcase',
    'Fixed cart page layout issue',
  ],
}

export default function Profile({ userdet }) {
  const navigate = useNavigate()
  const user = userdet?.id
    ? {
        name: userdet.firstName || userdet.username || 'User',
        email: userdet.email || 'Not available',
        role: 'Customer',
        location: 'India',
        bio: 'Managing your profile and shopping activity.',
        avatar:
          userdet.image ||
          'https://static.vecteezy.com/system/resources/thumbnails/048/334/475/small/a-person-icon-on-a-transparent-background-png.png',
        stats: [
          { label: 'Orders', value: '0' },
          { label: 'Saved', value: '0' },
          { label: 'Cart', value: '0' },
        ],
        recentActivity: ['Logged in successfully'],
      }
    : demoUser

  return (
    <div className="profile-page">
      <div className="cart-page-top">
        <button className="simple-back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="cart-page-title">Profile</h1>
      </div>

      <div className="profile-page-card">
        <img className="profile-page-avatar" src={user.avatar} alt="profile" />

        <div className="profile-page-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>{user.role}</p>
          <p>{user.location}</p>
        </div>
      </div>
    </div>
  )
}