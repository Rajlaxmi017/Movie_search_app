import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('movieFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const searchMovies = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=${process.env.REACT_APP_OMDB_API_KEY || 'YOUR_API_KEY'}`
      );
      const data = await response.json();

      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        throw new Error(data.Error || 'No movies found');
      }
    } catch (err) {
      setError(err.message);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovieDetails = async (imdbID) => {
    console.log("Fetching details for:", imdbID);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${process.env.REACT_APP_OMDB_API_KEY}`
      );
      const data = await response.json();
      console.log("Fetched movie details:", data);
      setSelectedMovie(data);
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    }
  };

  const toggleFavorite = (movie) => {
    if (favorites.some(fav => fav.imdbID === movie.imdbID)) {
      setFavorites(favorites.filter(fav => fav.imdbID !== movie.imdbID));
    } else {
      setFavorites([...favorites, movie]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMovies();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Movies Cineflex</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={searchMovies}>Search</button>
        </div>
      </header>

      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="movies-container">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-card" onClick={() => fetchMovieDetails(movie.imdbID)}>
            <img
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/200x300?text=No+Poster'}
              alt={`${movie.Title} movie poster`}
              onError={(e) => {
                e.target.src = 'https://placehold.co/200x300?text=Error';
              }}
            />
            <div className="movie-info">
              <h3>{movie.Title}</h3>
              <p>Year: {movie.Year}</p>
              <button
                className={`favorite-button ${favorites.some((fav) => fav.imdbID === movie.imdbID) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(movie);
                }}
              >
                {favorites.some((fav) => fav.imdbID === movie.imdbID) ? '★' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedMovie(null)}>X</button>
            <img
              src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://placehold.co/300x450?text=No+Image'}
              alt={`${selectedMovie.Title} poster`}
            />
            <div className="modal-info">
              <h2>{selectedMovie.Title} ({selectedMovie.Year})</h2>
              <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
              <p><strong>Director:</strong> {selectedMovie.Director}</p>
              <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
              <p><strong>Plot:</strong> {selectedMovie.Plot}</p>
              <p><strong>IMDB Rating:</strong> {selectedMovie.imdbRating}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
