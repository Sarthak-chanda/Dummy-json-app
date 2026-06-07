import { useState } from 'react'
import { useNavigate , useParams } from 'react-router-dom'

const Searchbar = ({ setSearchResult, setLoading , setNotfound }) => {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const  {p_name}  = useParams();

  const searching = async (query) => {
    setLoading(true)

    try {
      const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
      const response = await fetch(url)
      const result = await response.json()

      setSearchResult(result.products || [])
      // setName('')
      navigate(`/searchresult/product_name-${encodeURIComponent(query)}`) // Navigate to search results page
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
        <button type="submit">
          <svg>...</svg>
        </button>
      </form>
    </div>
  )
}

export default Searchbar