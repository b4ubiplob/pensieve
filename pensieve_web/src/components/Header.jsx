import './Header.css';

function Header({ isDarkMode, toggleTheme, renderUserIcon, searchPlaceholder = "Search...", showSearch = true, searchQuery = '', onSearchChange }) {
  return (
    <header className="pensieve-top-header">
      <div className="header-content">
        {showSearch && (
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
            <span className="material-symbols-outlined search-icon">search</span>
          </div>
        )}
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div className="user-avatar">
            {renderUserIcon()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
