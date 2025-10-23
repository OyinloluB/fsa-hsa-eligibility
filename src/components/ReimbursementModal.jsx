function ReimbursementModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h2 className="modal-title">Request Reimbursement</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
          }}
        >
          <div className="form-field">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required />
          </div>
          <div className="form-field">
            <label className="form-label">Order ID</label>
            <input type="text" className="form-input" required />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="modal-button modal-button--cancel"
            >
              Cancel
            </button>
            <button type="submit" className="modal-button modal-button--submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReimbursementModal;
