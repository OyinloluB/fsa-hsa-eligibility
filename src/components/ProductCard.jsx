function ProductCard({ product, badge, onBuyClick, onReimbursement }) {
  if (!product) {
    return null;
  }

  const productInfo = product.product_info;
  const priceInfo = product.price_info;
  const eligibility = product.hsa_eligibility;
  const status = eligibility?.status || "";

  const isEligible = status === "eligible";
  const isEligibleWithLMN =
    status === "eligible but requires letter of medical necessity (LMN)";
  const isNotEligible = status === "ineligible";

  return (
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
            <span className={`badge badge--large badge--${badge.variant}`}>
              {badge.text}
            </span>
          )}

          {isEligibleWithLMN && (
            <p className="lmn-message">
              A Letter of Medical Necessity from your doctor is required for
              reimbursement.
            </p>
          )}

          <h3 className="product-title">{productInfo?.title}</h3>

          {priceInfo?.price > 0 && (
            <p className="product-price">${priceInfo.price}</p>
          )}

          <p className="product-reason">{eligibility?.reason}</p>

          <div className="product-actions">
            {(isEligible || isEligibleWithLMN) && (
              <>
                <button
                  onClick={() => onBuyClick(productInfo?.base_url)}
                  className="action-button action-button--primary"
                >
                  Buy with pre-tax dollars
                </button>
                <button
                  onClick={onReimbursement}
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
                  onClick={() => onBuyClick(productInfo?.base_url)}
                  className="action-button action-button--muted"
                >
                  Buy normally
                </button>
                <button
                  onClick={onReimbursement}
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
  );
}

export default ProductCard;
