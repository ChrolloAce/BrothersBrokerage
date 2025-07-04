const Documents = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          Upload Document
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">Document management functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default Documents; 