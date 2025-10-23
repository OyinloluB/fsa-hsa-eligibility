function EligibilityForm({ inputUrl, onInputChange, onSubmit, loading, error }) {
  return (
    <>
      <form onSubmit={onSubmit} className="url-form">
        <label className="form-label">
          Product URL
          <input
            type="url"
            placeholder="Enter URL"
            value={inputUrl}
            onChange={(event) => onInputChange(event.target.value)}
            className={`form-input ${error ? "form-input--error" : ""}`}
          />
        </label>
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Checking..." : "Check Eligibility"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </>
  );
}

export default EligibilityForm;
