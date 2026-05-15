import { useState } from "react"

const Searchbar = ({ setSearchResult, setLoading, setNotFound ,setShowCart }) => {
  const [name, setName] = useState('')
  const handleChange = (e) => {
    setName(e.target.value)
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    setShowCart(false);   // switch back to results view
    searching(name.trim());
  };




  // Searchbar.jsx - Update the searching function
const searching = async (name) => {
  setLoading(true); // This now shows the overlay in App.jsx
  const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(name)}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    
    // Switch view only AFTER data is received to prevent flickering
    if (result.products && result.products.length > 0) {
      setSearchResult(result.products);
      setNotFound(false);
    } else {
      setSearchResult([]);
      setNotFound(true);
    }
    setName('');
  } catch (error) {
    setSearchResult([]);
    setNotFound(true);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="searchbar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="search products"
          value={name}
          onChange={handleChange}
        />
        <button type="submit">
          <svg>...</svg>
        </button>
      </form>
    </div>
  )
}

export default Searchbar