const Navbar = () => {
  return (
    <nav
      className="navbar navbar-dark"
      style={{
        background: "rgba(0,0,0,0.1)",
        position: "sticky",
        zIndex: "100",
        top: "0",
      }}
    >
      <div className="container-fluid">
        <button
          className="btn bi bi-grid-3x3-gap-fill text-white fs-5 "
          style={{ background: "rgba(255, 255, 255, 0.2)" }}
        />
        <a className="navbar-brand fw-bold font-monospace ms-auto" href="/">
          Trello
        </a>
        <button
          className="btn bi-person-circle text-white fs-5 ms-auto"
          style={{ background: "rgba(255, 255, 255, 0.2)" }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
