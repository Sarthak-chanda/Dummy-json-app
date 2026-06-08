import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Searchbar = ({ setSearchResult, setLoading, setNotfound }) => {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const { p_name } = useParams()

  const searching = async (query) => {
    setLoading(true)

    try {
      const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
      const response = await fetch(url)
      const result = await response.json()

      setSearchResult(result.products || [])
      navigate(`/searchresult/product_name-${encodeURIComponent(query)}`) 
    } catch (error) {
      setNotfound(true)
      setSearchResult([])
      navigate('/search')
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const query = name.trim()
    if (!query) return

    searching(query)
  }

  return (
    <div className="searchbar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="search products"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {/* Completely filled out SVG - No placeholders! */}
        <button type="submit" aria-label="Search">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default Searchbar