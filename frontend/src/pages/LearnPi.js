import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPiDigits } from "../api";

function formatPi(digits) {
  let result = [];
  for (let i = 0; i < digits.length; i++) {
    result.push(<span key={i}>{digits[i]}</span>);
    // Add non-breaking space every 5 characters (counting from 0, so after index 4, 9, 14, ...)
    if ((i + 1) % 5 === 0) result.push(<span key={`sp-${i}`}>&nbsp;</span>);
    if ((i + 1) % 50 === 0) result.push(<br key={`br-${i}`} />);
  }
  return result;
}

export default function LearnPi() {
  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPiDigits()
      .then(({ data }) => setDigits(data.digits))
      .catch(() => setError("Failed to load Pi digits."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>1,000 Digits of Pi</h2>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          Back to Home
        </Link>
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div
          className="p-4 border rounded bg-light"
          style={{ fontFamily: "monospace", fontSize: "1.05rem", lineHeight: "2" }}
        >
          {formatPi(digits)}
        </div>
      )}
    </div>
  );
}
