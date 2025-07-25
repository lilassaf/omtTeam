const MaintenancePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-5">
      <div className="max-w-md w-full p-10 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">🚧 Under Construction 🚧</h1>
        <p className="text-lg text-gray-600 mb-4 leading-relaxed">
          We're working hard to finish the development of this page. 
          It will be available soon!
        </p>
        <p className="text-gray-500 italic mb-8">
          Thank you for your patience.
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default MaintenancePage;