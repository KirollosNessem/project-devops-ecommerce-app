import "../Style/NavBar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <header className="header-area header-sticky">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav">

              <Link to="/" className="logo">
                <h4>
                  <em>Gaming</em> Strore
                </h4>
              </Link>

              <div className="search-input">
                {/* 
                <form id="search">
                  <input
                    type="text"
                    placeholder="Type Something"
                    id="searchText"
                    name="searchKeyword"
                  />
                  <i className="fa fa-search"></i>
                </form> 
                */}
              </div>

              <ul className="nav">
                <li>
                  <Link to="/">Home</Link>
                </li>

                <li>
                  <Link to="/cart">Cart</Link>
                </li>

                <li>
                  <Link to="/login">Login</Link>
                </li>

                <li>
                  <Link to="/profile">
                    Profile
                    <img src="src/assets/profile-header.jpg" alt="" />
                  </Link>
                </li>
              </ul>

              <a className="menu-trigger">
                <span>Menu</span>
              </a>

            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;