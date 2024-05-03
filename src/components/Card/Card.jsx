import "./Card.css";

const Card = ({ item, toggle, target, handleCardClick }) => {

  return (
    <div
      className="card me-2 ms-2 p-2"
      data-bs-toggle={toggle}
      data-bs-target={target}
      onClick={handleCardClick}
    >
      <div className="fw-bold fs-5  text-dark mb-1">{item.title}</div>
      <div
        className="fw-bolder text-black-50 overflow-auto"
        style={{ height: "50px" }}
      >
        {item.description}
      </div>
    </div>
  );
};

export default Card;
