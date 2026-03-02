import React, { useState } from "react";
import { Link } from "react-router-dom";
import { checkAnswer, saveResult } from "../api";
import { useAuth } from "../context/AuthContext";

export default function PiTest() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");
    setSaved(false);
    setSubmitting(true);
    try {
      const { data } = await checkAnswer(input);
      setResult(data);
    } catch {
      setError("Failed to check your answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveResult("test", result.digits_entered, result.correct_digits, result.score_percent);
      setSaved(true);
    } catch {
      setError("Failed to save result. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
    setSaved(false);
    setError("");
  };

  // Format a character sequence with spaces every 5 and line breaks every 50
  const renderChars = (chars, highlights) => {
    return chars.map((item, i) => {
      const ch = typeof item === "string" ? item : item.digit;
      const cls = highlights?.[i] === "incorrect"
        ? "pi-incorrect"
        : highlights?.[i] === "corrected"
        ? "pi-corrected"
        : "";
      return (
        <React.Fragment key={i}>
          <span className={cls}>{ch}</span>
          {(i + 1) % 5 === 0 && <span>&nbsp;</span>}
          {(i + 1) % 50 === 0 && <br />}
        </React.Fragment>
      );
    });
  };

  const userHighlights = result
    ? result.results.map((r) => (r.correct ? "" : "incorrect"))
    : [];
  const correctedHighlights = result
    ? result.results.map((r) => (r.correct ? "" : "corrected"))
    : [];

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Test Your Pi Knowledge</h2>
        <Link to="/" className="btn btn-outline-secondary btn-sm">Back to Home</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="pi_input">
            Enter the digits of Pi (starting with 3.14159…):
          </label>
          <input
            id="pi_input"
            type="text"
            className="form-control font-monospace"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="3.14159265358979..."
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn btn-primary me-2" disabled={submitting || !input.trim()}>
          {submitting ? "Checking…" : "Submit"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </form>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {result && (
        <div className="mt-4">
          <div className="alert alert-info">
            <strong>
              You got {result.correct_digits} out of {result.digits_entered} characters correct!
            </strong>
            <br />
            Score: <strong>{result.score_percent}%</strong>
          </div>

          {user && !saved && (
            <button
              className="btn btn-success mb-4"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Result"}
            </button>
          )}
          {saved && (
            <div className="alert alert-success mb-4">Result saved! View it in your <Link to="/profile">profile</Link>.</div>
          )}
          {!user && (
            <p className="text-muted mb-4">
              <Link to="/login">Log in</Link> to save your results.
            </p>
          )}

          <div className="mb-4">
            <h5>Your Input:</h5>
            <div className="p-3 border rounded bg-light font-monospace" style={{ lineHeight: "2" }}>
              {renderChars(
                result.results.map((r) => r.digit),
                userHighlights
              )}
            </div>
          </div>

          <div className="mb-4">
            <h5>Corrected Pi:</h5>
            <div className="p-3 border rounded bg-light font-monospace" style={{ lineHeight: "2" }}>
              {renderChars(
                result.results.map((r) => r.expected ?? r.digit),
                correctedHighlights
              )}
            </div>
          </div>

          {result.next_digits && (
            <div className="mb-4">
              <h5>Next Digits:</h5>
              <div className="p-3 border rounded bg-light font-monospace">
                {result.next_digits}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
