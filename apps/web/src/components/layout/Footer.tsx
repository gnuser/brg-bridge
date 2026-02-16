export function Footer() {
  return (
    <footer className="border-t border-bridge-border px-6 py-4 mt-auto">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500">
        <span>Powered by LayerZero V2</span>
        <div className="flex gap-4">
          <a
            href="https://layerzeroscan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            LayerZero Scan
          </a>
          <a
            href="https://docs.layerzero.network/v2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
