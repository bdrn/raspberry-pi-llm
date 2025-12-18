import { Link } from "react-router-dom";

const Navbar = () => {
  const navStyle = {
    background: "#333",
    color: "#fff",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    marginLeft: "20px",
    fontWeight: "bold",
  };

  return (
    <nav style={navStyle}>
      <h1 style={{ margin: 0 }}>Study Buddy Web</h1>
      <div>
        <Link to="/" style={linkStyle}>
          Dashboard
        </Link>
        <Link to="/pair" style={linkStyle}>
          Pair Device
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
