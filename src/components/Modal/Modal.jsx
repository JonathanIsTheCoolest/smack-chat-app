import React from "react";
import PropTypes from 'prop-types';
import "./Modal.css"

const Modal = ({ children, title, close, isOpen, isLightAvatar, setIsEditUser }) => {
    const closeModal = () => {
      if (!!setIsEditUser) {
        close(false)
        setIsEditUser(false)
      } else {
        close(false)
      }
    }
    return (
      <>
        {isOpen ? (
          <div className="modal">
            <div className="modal-dialog">
              <div className={isLightAvatar ? "modal-content content-light" : "modal-content content-dark"}>
                <div className="modal-header">
                  <h5 className="modal-title">{title}</h5>
                  <button onClick={closeModal} className="close">&times;</button>
                </div>
                <div className="modal-body">
                  {children}
                </div>
              </div>
            </div>
          </div>
        ) : null} 
      </>
    )
  };

Modal.propTypes = {
  title: PropTypes.string,
  close: PropTypes.func,
  isOpen: PropTypes.bool,
}

Modal.defaultProps = {
  title: 'Title',
  close: () => {},
  isOpen: false,
}

export default Modal;