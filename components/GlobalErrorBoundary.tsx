"use client";

import React from "react";
import { appendForgeLogEntry } from "@/lib/forgeLog";

type GlobalErrorBoundaryProps = {
  children: React.ReactNode;
};

type GlobalErrorBoundaryState = {
  hasError: boolean;
};

export default class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    appendForgeLogEntry({
      category: "runtime",
      level: "error",
      message: `Global boundary captured: ${error.message}`,
    }).catch(() => undefined);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <section className="gilded-card max-w-lg p-8 text-center" aria-live="assertive">
            <p className="smallcaps-label text-red-400">Forge Interrupted</p>
            <h1 className="mt-4 font-brand text-3xl text-white">A runtime fault interrupted the archive.</h1>
            <p className="mt-3 text-sm text-zinc-400">
              Your local state remains preserved. Retry the interface to resume command.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-6 rounded-xl border border-amber-300/35 bg-black/30 px-5 py-3 text-sm font-black transition-colors hover:bg-black/55"
            >
              Retry Forge
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
