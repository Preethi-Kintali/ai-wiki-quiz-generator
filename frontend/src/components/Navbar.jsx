import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>📘 Wiki Quiz</h2>

      <div style={styles.links}>
        <NavLink to="/" style={styles.link}>
          Home
        </NavLink>
        <NavLink to="/history" style={styles.link}>
          History
        </NavLink>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 32px",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "24px",
  },
  logo: {
    margin: 0,
    color: "#6366f1",
  },
  links: {
    display: "flex",
    gap: "16px",
  },
  link: {
    textDecoration: "none",
    fontWeight: 500,
    color: "#374151",
  },
};
