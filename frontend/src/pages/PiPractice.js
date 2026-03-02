import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getPiDigits, saveResult } from "../api";
import { useAuth } from "../context/AuthContext";

export default function PiPractice() {
  const { user } = useAuth();

  const [piDigits, setPiDigits] = useState("");
  const [loadError, setLoadError] = useState("");

  // Practice state
  const [input, setInput] = useState("");
  const [startPos, setStartPos] = useState(0);
  const [startInput, setStartInput] = useState("");

  // Toggle visibility
  const [showCorrected, setShowCorrected] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showStartDigits, setShowStartDigits] = useState(false);

  // Save state
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    getPiDigits()
      .then(({ data }) => setPiDigits(data.digits))
      .catch(() => setLoadError("Failed to load Pi digits."));
  }, []);

  // Derive working sequence from the chosen start position
  const workingPi = piDigits.slice(startPos);

  // Previous digits context (up to 10 chars before start)
  const previousDigits =
    startPos === 0
      ? ""
      : startPos < 10
      ? piDigits.slice(0, startPos)
      : piDigits.slice(startPos - 10, startPos);

  // Character-by-character comparison
  const feedback = input.split("").map((ch, i) => {
    const expected = workingPi[i];
    const correct = ch === expected;
    return { ch, expected, correct };
  });

  const correctCount = feedback.filter((f) => f.correct).length;
  const totalTyped = feedback.length;
  const nextDigits = workingPi.slice(totalTyped, totalTyped + 10);

  const handleStartSubmit = (e) => {
    e.preventDefault();
    const pos = parseInt(startInput, 10);
    if (!isNaN(pos) && pos >= 0 && pos < piDigits.length) {
      setStartPos(pos);
      setInput("");
      setSaved(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleClear = () => {
    setInput("");
    setSaved(false);
    setSaveError("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSave = async () => {
    if (totalTyped === 0) return;
    const scorePercent = Math.round((correctCount / totalTyped) * 10000) / 100;
    setSaving(true);
    setSaveError("");
    try {
      await saveResult("practice", totalTyped, correctCount, scorePercent);
      setSaved(true);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderFeedback = (items, type) =>
    items.map((f, i) => {
      const ch = type === "user" ? f.ch : (f.expected ?? f.ch);
      const cls = f.correct ? "" : type === "user" ? "pi-incorrect" : "pi-corrected";
      return (
        <React.Fragment key={i}>
          <span className={cls}>{ch}</span>
          {(i + 1) % 5 === 0 && <span>&nbsp;</span>}
          {(i + 1) % 50 === 0 && <br />}
        </React.Fragment>
      );
    });

  if (loadError) return <div className="container py-5 alert alert-danger">{loadError}</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Practice Pi</h2>
        <Link to="/" className="btn btn-outline-secondary btn-sm">Back to Home</Link>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="pi_practice_input">
          Enter Digits of Pi:
        </label>
        <input
          id="pi_practice_input"
          ref={inputRef}
          type="text"
          className="form-control font-monospace"
          value={input}
          onChange={(e) => { setInput(e.target.value); setSaved(false); }}
          placeholder={piDigits ? piDigits.slice(startPos, startPos + 20) + "…" : "Loading…"}
          autoComplete="off"
        />
      </div>

      <p className="text-muted">
        Total Characters Typed: <strong>{totalTyped}</strong>
        {totalTyped > 0 && (
          <> &nbsp;|&nbsp; Correct: <strong>{correctCount}</strong></>
        )}
      </p>

      {previousDigits && (
        <p className="text-muted font-monospace">
          Previous digits: <em>{previousDigits}</em>
        </p>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className="btn btn-secondary btn-sm" onClick={handleClear}>
          Clear
        </button>
        <button
          className={`btn btn-sm ${showCorrected ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setShowCorrected((v) => !v)}
        >
          Corrected Pi
        </button>
        <button
          className={`btn btn-sm ${showNext ? "btn-info" : "btn-outline-info"}`}
          onClick={() => setShowNext((v) => !v)}
        >
          Next Digits
        </button>
        <button
          className={`btn btn-sm ${showStartDigits ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => setShowStartDigits((v) => !v)}
        >
          Start Position
        </button>
      </div>

      {showStartDigits && (
        <form onSubmit={handleStartSubmit} className="mb-4">
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text">Start at digit #</span>
            <input
              type="number"
              className="form-control"
              min={0}
              max={piDigits.length - 1}
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              placeholder="0"
            />
            <button type="submit" className="btn btn-dark">
              Go
            </button>
          </div>
        </form>
      )}

      {input.length > 0 && (
        <>
          <div className="mb-3">
            <h5>Your Input:</h5>
            <div className="p-3 border rounded bg-light font-monospace" style={{ lineHeight: "2" }}>
              {renderFeedback(feedback, "user")}
            </div>
          </div>

          {showCorrected && (
            <div className="mb-3">
              <h5>Corrected Pi:</h5>
              <div className="p-3 border rounded bg-light font-monospace" style={{ lineHeight: "2" }}>
                {renderFeedback(feedback, "corrected")}
              </div>
            </div>
          )}

          {showNext && (
            <div className="mb-3">
              <h5>Next Digits:</h5>
              <div className="p-3 border rounded bg-light font-monospace">
                {nextDigits || <em className="text-muted">End of stored digits</em>}
              </div>
            </div>
          )}

          <div className="mt-3">
            {user && !saved && (
              <button
                className="btn btn-success me-2"
                onClick={handleSave}
                disabled={saving || totalTyped === 0}
              >
                {saving ? "Saving…" : "Save Session"}
              </button>
            )}
            {saved && (
              <span className="text-success me-3">
                Saved! <Link to="/profile">View results</Link>
              </span>
            )}
            {!user && (
              <span className="text-muted">
                <Link to="/login">Log in</Link> to save your session.
              </span>
            )}
            {saveError && <div className="text-danger mt-1">{saveError}</div>}
          </div>
        </>
      )}
    </div>
  );
}
