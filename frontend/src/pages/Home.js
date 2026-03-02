import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold">
          Pi Game <span style={{ color: "#6c757d" }}>π</span>
        </h1>
        <p className="lead text-muted">
          Test your memory, practice your recall, and learn the digits of Pi.
        </p>
        {user && (
          <p className="text-success fw-semibold">
            Welcome back, {user.username}!
          </p>
        )}
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm text-center">
            <div className="card-body p-4">
              <h2 className="card-title fs-1 mb-3">Test</h2>
              <p className="card-text text-muted">
                Enter as many digits of Pi as you can remember and get an instant
                score with highlighted feedback.
              </p>
              <Link to="/test" className="btn btn-primary mt-3 px-4">
                Take the Test
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm text-center">
            <div className="card-body p-4">
              <h2 className="card-title fs-1 mb-3">Practice</h2>
              <p className="card-text text-muted">
                Type Pi digits and get real-time feedback on every keystroke.
                Start from any position you choose.
              </p>
              <Link to="/practice" className="btn btn-success mt-3 px-4">
                Start Practicing
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm text-center">
            <div className="card-body p-4">
              <h2 className="card-title fs-1 mb-3">Learn</h2>
              <p className="card-text text-muted">
                Browse all 1,000 digits of Pi formatted for easy reading and
                study.
              </p>
              <Link to="/learn" className="btn btn-info mt-3 px-4 text-white">
                View Pi Digits
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <div className="text-center mt-5">
          <p className="text-muted">
            <Link to="/register">Create an account</Link> to save your test
            results and track your progress over time.
          </p>
        </div>
      )}

      {user && (
        <div className="text-center mt-5">
          <Link to="/profile" className="btn btn-outline-secondary">
            View My Results History
          </Link>
        </div>
      )}
    </div>
  );
}
