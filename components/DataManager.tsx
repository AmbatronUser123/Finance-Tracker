import React from 'react';
import { FiUpload, FiDownload } from 'react-icons/fi';

interface DataManagerProps {
  onImport: (data: any) => void;
  onExport: (format: 'json' | 'pdf' | 'csv') => void;
}

const DataManager: React.FC<DataManagerProps> = ({ onImport, onExport }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onImport(data);
        } catch (error) {
          console.error('Failed to parse JSON', error);
          // You might want to show a toast notification here
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Data Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-700">Import Data</h3>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">JSON or CSV files</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".json,.csv" />
            </label>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-700">Export Data</h3>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => onExport('json')}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDownload />
              Export as JSON
            </button>
            <button 
              onClick={() => onExport('pdf')}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiDownload />
              Export as PDF
            </button>
            <button 
              onClick={() => onExport('csv')}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiDownload />
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
