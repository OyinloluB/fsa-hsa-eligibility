import "./App.css"
import { useState, useEffect, useCallback } from "react";

const API_URL = "https://float-web-backend.onrender.com/check-hsa-eligibility";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [recentChecks, setRecentChecks] = useState([]);

  const saveToRecent = useCallback((url, data) => {
    const productInfo = data[0].product_info;
    const eligibilityStatus = data[0].hsa_eligibility.status;
    const normalizedDomain = new URL(productInfo.base_url)
      .hostname.replace("www.", "");

    const checkRecord = {
      url,
      normalizedDomain,
      eligibilityStatus,
      title: productInfo.title,
      image: productInfo.product_image_url,
      checkedAt: new Date().toISOString(),
    };

    setRecentChecks((prev) => {
      const updated = [checkRecord, ...prev.filter((c) => c.url !== url)].slice(
        0,
        5
      );
      localStorage.setItem("recentChecks", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const checkEligibility = useCallback(
    async (url) => {
      try {
        setLoading(true);
        setError("");
        setResult(null);

        const params = new URLSearchParams(window.location.search);
        params.set("url", url);
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params.toString()}`
        );

        const res = await fetch(
          `${API_URL}?user_email=shubhi@withfloat.io&hit_cache=true&url=${encodeURIComponent(
            url
          )}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);
        setResult(data);
        saveToRecent(url, data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [saveToRecent]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");

    const saved = localStorage.getItem("recentChecks");
    if (saved) {
      setRecentChecks(JSON.parse(saved));
    }

    if (urlParam) {
      setInputUrl(urlParam);
      checkEligibility(urlParam);
    }
  }, [checkEligibility]);

  useEffect(() => {
    if (result?.[0]?.product_info) {
      const productInfo = result[0].product_info;
      const merchantDomain = new URL(productInfo.base_url).hostname.replace('www.', '');
      document.title = `${productInfo.title} - ${merchantDomain} | FSA/HSA Eligibility`;
    } else {
      document.title = "Product Eligibility Checker";
    }
  }, [result]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputUrl.trim()) {
      setError("Please enter a product URL");
      return;
    }

    checkEligibility(inputUrl);
  };

  const handleRecentClick = (check) => {
    setInputUrl(check.url);
    checkEligibility(check.url);
  };

  const getEligibilityBadge = (status) => {
    if (status === "eligible") {
      return { text: "Eligible", variant: "eligible" };
    } else if (status === "eligible but requires letter of medical necessity (LMN)") {
      return { text: "Eligible with LMN", variant: "eligible-lmn" };
    } else {
      return { text: "Not Eligible", variant: "ineligible" };
    }
  };

  const handleBuyClick = (baseUrl) => {
    if (baseUrl) {
      window.open(baseUrl, "_blank");
    }
  };

  const handleReimbursementClick = () => {
    setShowModal(true);
  };

  const productData = result?.[0];
  const productInfo = productData?.product_info;
  const priceInfo = productData?.price_info;
  const eligibility = productData?.hsa_eligibility;
  
  const badge = eligibility ? getEligibilityBadge(eligibility.status) : null;
  const isEligible = eligibility?.status === "eligible";
  const isEligibleWithLMN = eligibility?.status === "eligible but requires letter of medical necessity (LMN)";
  const isNotEligible = eligibility?.status === "ineligible";

  return (
    <div className="app-container">
      <main className="main-content">
        <h1 className="page-title">Product Eligibility Checker</h1>
        <p className="page-subtitle">
          Check if a product is eligible for FSA/HSA reimbursement
        </p>

        <form onSubmit={handleSubmit} className="url-form">
          <label className="form-label">
            Product URL
            <input
              type="url"
              placeholder="https://www.amazon.com/product-name/dp/..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Checking..." : "Check"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {productData && (
          <div className="product-card">
            <div className="product-card-body">
              {productInfo?.product_image_url && (
                <img
                  src={productInfo.product_image_url}
                  alt=""
                  className="product-image"
                />
              )}
              <div className="product-details">
                {badge && (
                  <span
                    className={`badge badge--large badge--${badge.variant}`}
                  >
                    {badge.text}
                  </span>
                )}

                {isEligibleWithLMN && (
                  <p className="lmn-message">
                    A Letter of Medical Necessity from your doctor is required
                    for reimbursement.
                  </p>
                )}

                <h3 className="product-title">{productInfo.title}</h3>

                {priceInfo?.price > 0 && (
                  <p className="product-price">${priceInfo.price}</p>
                )}

                <p className="product-reason">{eligibility.reason}</p>

                <div className="product-actions">
                  {(isEligible || isEligibleWithLMN) && (
                    <>
                      <button
                        onClick={() => handleBuyClick(productInfo.base_url)}
                        className="action-button action-button--primary"
                      >
                        Buy with pre-tax dollars
                      </button>
                      <button
                        onClick={handleReimbursementClick}
                        className="action-button action-button--outline"
                      >
                        Get reimbursed with float
                      </button>
                    </>
                  )}

                  {isNotEligible && (
                    <>
                      <p className="not-eligible-note">
                        Not typically covered. You can still buy normally.
                      </p>
                      <button
                        onClick={() => handleBuyClick(productInfo.base_url)}
                        className="action-button action-button--muted"
                      >
                        Buy normally
                      </button>
                      <button
                        onClick={handleReimbursementClick}
                        className="action-button action-button--light"
                      >
                        Get reimbursed with float
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {recentChecks.length > 0 && (
          <div className="recent-checks">
            <h3 className="recent-checks-title">Recent Checks</h3>
            <div className="recent-checks-list">
              {recentChecks.map((check, index) => {
                const checkBadge = getEligibilityBadge(check.eligibilityStatus);

                return (
                  <div
                    key={index}
                    onClick={() => handleRecentClick(check)}
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
                      <p className="recent-check-domain">
                        {check.normalizedDomain}
                      </p>
                    </div>
                    <span
                      className={`badge badge--small badge--${checkBadge.variant}`}
                    >
                      {checkBadge.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Request Reimbursement</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowModal(false);
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
                  onClick={() => setShowModal(false)}
                  className="modal-button modal-button--cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-button modal-button--submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
