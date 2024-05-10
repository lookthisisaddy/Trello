import { useContext, useEffect, useRef, useState } from "react";
import Card from "./Card/Card";
import { BoardContext } from "../context/BoardContext";
import { Draggable, Droppable, DragDropContext } from "react-beautiful-dnd";

const Main = () => {
  
  const { allBoard, setAllBoard } = useContext(BoardContext);
  const [modalData, setModalData] = useState({
    title: "",
    description: "",
    selectedItem: "",
    editMode: false,
    editedCardId: null,
  });
  
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [dropDownError, setDropDownError] = useState("");
  const prevSelectedItemRef = useRef(null);

  const handleModalTitleChange = (e) => {
    setModalData({ ...modalData, title: e.target.value });
    setTitleError("");
  };

  const handleModalDescChange = (e) => {
    setModalData({ ...modalData, description: e.target.value });
    setDescriptionError("");
  };

  const handleModalDropdownSelect = (selectedList) => {
    if (!prevSelectedItemRef.current) {
      prevSelectedItemRef.current = modalData.selectedItem;
    }
    setModalData({
      ...modalData,
      selectedItem: selectedList,
    });
    setDropDownError("");
  };

  const handleCardClick = (title, description, selectedItem, cardId) => {
    setModalData({
      title: title,
      description: description,
      selectedItem: selectedItem,
      editMode: true,
      editedCardId: cardId,
    });
  };

  const handleModalClose = () => {
    setModalData({
      title: "",
      description: "",
      selectedItem: "",
      editMode: false,
      editedCardId: null,
    });
    setTitleError("");
    setDescriptionError("");
    setDropDownError("");
  };

  const handleSaveChanges = () => {
    const isValidTitle = /^[a-zA-Z\s]+$/.test(modalData.title.trim());
    const isValidDescription = modalData.description.trim().length >= 25;
    const isValidSelectedItem = modalData.selectedItem.length ? true : false;

    if (!isValidTitle) {
      setTitleError("Title must contain only alphabets and spaces");
    } else {
      setTitleError("");
    }

    if (!isValidDescription) {
      setDescriptionError("Description must be at least 25 characters long");
    } else {
      setDescriptionError("");
    }

    if (!isValidSelectedItem) {
      setDropDownError("Please provide a list");
    } else {
      setDropDownError("");
    }

    if (!isValidTitle || !isValidDescription || !isValidSelectedItem) {
      return; // Prevent saving if form is invalid
    }
    if (modalData.editMode) {
      /* -------- Editing and moving the existing card --------- */
      // Update with changing the list
      if (
        prevSelectedItemRef.current &&
        prevSelectedItemRef.current !== modalData.selectedItem
      ) {
        let editedCard = {};
        // Remove the edited card from the previous selected list
        const updatedAllBoard = {
          lists: allBoard.lists.map((list) => {
            if (list.label === prevSelectedItemRef.current) {
              editedCard = list.items.find(
                (item) => item.id === modalData.editedCardId
              );
              if (editedCard) {
                const filteredItems = list.items.filter(
                  (item) => item.id !== modalData.editedCardId
                );
                return { ...list, items: filteredItems };
              }
            }
            return list;
          }),
        };
        // Find the selected list and add the edited card to it
        updatedAllBoard.lists.forEach((list) => {
          if (list.label === modalData.selectedItem) {
            list.items.push(editedCard);
          }
        });
        // Update the board state with the new lists
        setAllBoard(updatedAllBoard);
      }
      // Update without changing the list
      else {
        const updatedList = allBoard.lists.map((list) => {
          if (list.label === modalData.selectedItem) {
            // Finding the card to update
            const updatedItems = list.items.map((item) =>
              item.id === modalData.editedCardId
                ? {
                    ...item,
                    title: modalData.title,
                    description: modalData.description,
                  }
                : item
            );
            // Moving the updated card to the end of the list
            const filteredItems = updatedItems.filter(
              (item) => item.id !== modalData.editedCardId
            );
            return {
              ...list,
              items: [
                ...filteredItems,
                updatedItems.find((item) => item.id === modalData.editedCardId),
              ],
            };
          }
          return list;
        });
        setAllBoard({ ...allBoard, lists: updatedList });
      }
    } else {
      /* -------- Adding a new card in a list --------- */
      const newList = allBoard.lists.map((list) => {
        if (list.label === modalData.selectedItem) {
          return {
            ...list,
            items: [
              ...list.items,
              {
                id: `${Date.now()}`,
                title: modalData.title,
                description: modalData.description,
              },
            ],
          };
        }
        return list;
      });
      setAllBoard({ ...allBoard, lists: newList });
    }

    prevSelectedItemRef.current = "";
    setModalData({
      title: "",
      description: "",
      selectedItem: "",
      editMode: false,
      editedCardId: null,
    });

    const modalElement = document.getElementById("exampleModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  };

  const handleAddCard = () => {
    setModalData({
      title: "",
      description: "",
      selectedItem: "",
      editMode: false,
      editedCardId: null,
    });
    setTitleError("");
    setDescriptionError("");
    setDropDownError("");
  };

  const handleDeleteCard = () => {
    if (modalData.editedCardId) {
      const newList = allBoard.lists.map((list) => {
        if (list.label === modalData.selectedItem) {
          return {
            ...list,
            items: list.items.filter(
              (item) => item.id !== modalData.editedCardId
            ),
          };
        }
        return list;
      });

      setAllBoard({ ...allBoard, lists: newList });

      setModalData({
        title: "",
        description: "",
        selectedItem: "",
        editMode: false,
        editedCardId: null,
      });
    }
  };

  function onDragEnd(res) {
    if (!res.destination) {
      console.log("No Destination");
      return;
    }
    const newLists = [...allBoard.lists];
    const s_id = parseInt(res.source.droppableId);
    const d_id = parseInt(res.destination.droppableId);
    const [removed] = newLists[s_id - 1].items.splice(res.source.index, 1);
    newLists[d_id - 1].items.splice(res.destination.index, 0, removed);
    setAllBoard({lists: newLists});
  }

  return (
    <div
      className="d-flex flex-column text-white w-100 font-monospace"
      style={{ height: "calc(100vh - 60px)" }}
    >
      {/* Main header */}
      <div className="d-flex flex-row p-2 mt-1">
        <div className="fw-bold fs-4 me-3">Team Board</div>

        {/* Add Card button */}
        <button
          className="btn fs-6 text-white"
          data-bs-toggle="modal"
          onClick={handleAddCard}
          data-bs-target="#exampleModal"
          style={{ background: "rgba(255, 255, 255, 0.2)" }}
        >
          <i className="bi bi-plus-lg me-1"></i>
          <span>Add Card</span>
        </button>

        {/* Add Card Modal */}
        <div
          className="modal fade"
          id="exampleModal"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title text-black-50"
                  id="exampleModalLabel"
                >
                  {modalData.editMode ? "Edit Card" : "Add Card"}
                </h5>
                {modalData.editMode && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                    onClick={handleDeleteCard}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="modal-body">
                <>
                  <div>
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label text-black-50 fw-bold"
                    >
                      Title
                    </label>
                    <input
                      value={modalData.title}
                      onChange={handleModalTitleChange}
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      placeholder="Enter title"
                    />
                    {titleError && (
                      <div className="text-danger">{titleError}</div>
                    )}
                  </div>
                  <div className="mt-2">
                    <label
                      htmlFor="exampleFormControlTextarea1"
                      className="form-label text-black-50 fw-bold"
                    >
                      Description
                    </label>
                    <textarea
                      value={modalData.description}
                      onChange={handleModalDescChange}
                      className="form-control"
                      id="exampleFormControlTextarea1"
                      rows={2}
                      placeholder="Enter description"
                    />
                    {descriptionError && (
                      <div className="text-danger">{descriptionError}</div>
                    )}
                  </div>
                  <div className="dropdown mt-3">
                    <button
                      className="btn btn-primary dropdown-toggle"
                      type="button"
                      id="dropdownMenuButton1"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {modalData.selectedItem
                        ? modalData.selectedItem
                        : "Select a list"}
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButton1"
                    >
                      {allBoard.lists.map((item) => (
                        <li>
                          <div
                            className="dropdown-item"
                            onClick={() =>
                              handleModalDropdownSelect(item.label)
                            }
                          >
                            {item.label}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {dropDownError && (
                      <div className="text-danger">{dropDownError}</div>
                    )}
                  </div>
                </>
              </div>
              <div className="modal-footer">
                <button
                  onClick={handleModalClose}
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveChanges}
                  type="button"
                  className="btn btn-success"
                  // data-bs-dismiss="modal"
                >
                  {modalData.editMode ? "Save Changes" : "Add Card"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container-fluid mt-1">
        <div className="row gy-2 gx-2">
          {/* Lists */}
          <DragDropContext onDragEnd={onDragEnd}>
            {allBoard.lists &&
              allBoard.lists.map((each, ind) => {
                return (
                  <div key={ind} className="col-12 col-sm-6 col-lg-3">
                    <div
                      className="card"
                      style={{
                        background: "#ebecf0",
                      }}
                    >
                      {/* List Header */}
                      <div className="ms-2 me-2 p-2 d-flex align-items-center fs-5 font-monospace text-black-50 fw-bold text-body justify-content-between">
                        <div>{each.label}</div>
                        <button className="btn">
                          <i className="bi bi-three-dots"></i>
                        </button>
                      </div>

                      {/* List  Body*/}
                      <div
                        style={{
                          maxHeight: "calc(75vh - 100px)",
                          overflowY: "auto",
                        }}
                      >
                        <Droppable droppableId={each.id} type="PERSON">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              style={{
                                backgroundColor: snapshot.isDraggingOver
                                  ? "transparent"
                                  : "transparent",
                              }}
                              {...provided.droppableProps}
                            >
                              {each.items &&
                                each.items.map((item, index) => {
                                  return (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          className="py-1"
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <Card
                                            handleCardClick={() =>
                                              handleCardClick(
                                                item.title,
                                                item.description,
                                                each.label,
                                                item.id
                                              )
                                            }
                                            item={item}
                                            toggle="modal"
                                            target="#exampleModal"
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  </div>
                );
              })}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default Main;
