"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div style={{
          position: "fixed", inset: 0, background: "#0f0f0f", color: "#888",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 12, fontFamily: "system-ui"
        }}>
          <div style={{ fontSize: 32 }}>⬡</div>
          <div style={{ fontSize: 14, color: "#e8a030" }}>3D scene could not be loaded</div>
          <div style={{ fontSize: 12, maxWidth: 400, textAlign: "center", opacity: 0.6 }}>
            {this.state.error.message}
          </div>
          <div style={{ fontSize: 11, opacity: 0.4 }}>
            Tip: browser shields/extensions may block WebGL
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
