import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getResults } from "../api";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function Profile() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getResults()
      .then(({ data }) => setResults(data))
      .catch(() => setError("Failed to load results."))
      .finally(() => setLoading(false));
  }, []);

  const testResults = results.filter((r) => r.mode === "test");
  const practiceResults = results.filter((r) => r.mode === "practice");

  const bestTest =
    testResults.length > 0
      ? testResults.reduce((best, r) =>
          r.correct_digits > best.correct_digits ? r : best
        )
      : null;

  return (
    <div className="container py-5">
      <h2 className="mb-1">Welcome, {user.username}</h2>
      <p className="text-muted mb-4">{user.email}</p>

      {bestTest && (
        <div className="alert alert-success">
          Personal best: <strong>{bestTest.correct_digits}</strong> correct digits
          ({bestTest.score_percent}%) on a Pi Test
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && results.length === 0 && (
        <p className="text-muted">
          You haven't saved any results yet. Take a test or practice session
          and save your score!
        </p>
      )}

      {!loading && testResults.length > 0 && (
        <>
          <h4 className="mt-4 mb-3">Pi Test Results</h4>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Correct Digits</th>
                  <th>Digits Entered</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.created_at)}</td>
                    <td>{r.correct_digits}</td>
                    <td>{r.digits_entered}</td>
                    <td>{r.score_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && practiceResults.length > 0 && (
        <>
          <h4 className="mt-4 mb-3">Practice Session Results</h4>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Correct Digits</th>
                  <th>Digits Entered</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {practiceResults.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.created_at)}</td>
                    <td>{r.correct_digits}</td>
                    <td>{r.digits_entered}</td>
                    <td>{r.score_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
