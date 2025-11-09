import React from 'react';
// We don't need useState, useEffect, or any api calls here anymore

function HistoryTab({ historyList, isLoading, error, onDetailsClick }) {
  
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading history...</p>;
  }

  // We display the main error from App.jsx
  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      {/* The History Table */}
      {historyList.length === 0 ? (
        <p className="text-center text-gray-500">No quizzes generated yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyList.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{item.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date_generated).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onDetailsClick(item.id)} // Use the function from props
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* The Modal has been moved to App.jsx, so we remove it from here. */}
    </div>
  );
}

export default HistoryTab;