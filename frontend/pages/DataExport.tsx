import ErrorBoundary from "../components/ErrorBoundary";
import DataExportPanel from "../components/DataExportPanel";

export default function DataExport() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Data Export & Backup
          </h1>
          <p className="text-xl text-slate-600">Export your academic data for backup or analysis</p>
        </div>

        {/* Export Panel */}
        <DataExportPanel />

        {/* Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">📦 Export Formats</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>JSON:</strong> Complete data with full structure and relationships</li>
              <li><strong>CSV:</strong> Spreadsheet-friendly format for analysis</li>
            </ul>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3">🔒 Privacy & Security</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• All exports are private and secure</li>
              <li>• Download links expire after 7 days</li>
              <li>• Only you can access your exported data</li>
            </ul>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
