import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user from localStorage
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
          throw new Error('No user logged in');
        }
        
        const user = JSON.parse(userData);
        
        // Fetch account details
        const accountResponse = await axios.get(`http://localhost:3000/api/account/${user.accountId}`);
        setAccount(accountResponse.data.data);
        
        // Fetch all opportunities
        const opportunitiesResponse = await axios.get('http://localhost:3000/api/opportunities');
        
        // Filter opportunities for the current account
        const userOpportunities = opportunitiesResponse.data.data.filter(opp => {
          return opp.account && opp.account.display_value === accountResponse.data.data.name;
        });
        
        setOpportunities(userOpportunities);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-lg">
        Loading opportunities...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!opportunities.length) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
        No opportunities found for your account.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-[#005baa] mb-6">Your Opportunities</h2>
      
      {account && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Account: {account.name}</h3>
          <p className="text-gray-600">Account ID: {account.sys_id}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closed Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opportunities.map((opp) => (
              <tr key={opp.sys_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opp.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="font-medium">{opp.short_description}</div>
                  {opp.description && <div className="text-gray-400">{opp.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${opp.stage.display_value.includes('Won') ? 'bg-green-100 text-green-800' : 
                      opp.stage.display_value.includes('Lost') ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {opp.stage.display_value}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{opp.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {opp.actual_closed_date ? new Date(opp.actual_closed_date).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserOpportunities;