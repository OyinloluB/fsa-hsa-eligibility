function RecentChecks({ checks, onSelect, resolveBadge }) {
  if (!checks.length) {
    return null;
  }

  return (
    <div className="recent-checks">
      <h3 className="recent-checks-title">Recent Checks</h3>
      <div className="recent-checks-list">
        {checks.map((check, index) => {
          const badge = resolveBadge(check.eligibilityStatus);

          return (
            <div
              key={index}
              onClick={() => onSelect(check)}
              className="recent-check"
            >
              {check.image && (
                <img
                  src={check.image}
                  alt=""
                  className="recent-check-image"
                />
              )}
              <div className="recent-check-details">
                <p className="recent-check-title">{check.title}</p>
                <p className="recent-check-domain">{check.normalizedDomain}</p>
              </div>
              <span className={`badge badge--small badge--${badge.variant}`}>
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentChecks;
