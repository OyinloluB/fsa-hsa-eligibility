import "./App.css";
import { useState, useEffect, useCallback } from "react";
import EligibilityForm from "./components/EligibilityForm.jsx";
import ProductCard from "./components/ProductCard.jsx";
import RecentChecks from "./components/RecentChecks.jsx";
import ReimbursementModal from "./components/ReimbursementModal.jsx";

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
  const eligibility = productData?.hsa_eligibility;
  const badge = eligibility ? getEligibilityBadge(eligibility.status) : null;

  return (
    <div className="app-container">
      <main className="main-content">
        <h1 className="page-title">Product Eligibility Checker</h1>
        <p className="page-subtitle">
          Check if a product is eligible for FSA/HSA reimbursement
        </p>

        <EligibilityForm
          inputUrl={inputUrl}
          onInputChange={setInputUrl}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        <ProductCard
          product={productData}
          badge={badge}
          onBuyClick={handleBuyClick}
          onReimbursement={handleReimbursementClick}
        />

        <RecentChecks
          checks={recentChecks}
          onSelect={handleRecentClick}
          resolveBadge={getEligibilityBadge}
        />
      </main>

      <ReimbursementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default App;
