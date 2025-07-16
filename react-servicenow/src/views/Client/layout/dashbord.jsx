import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./dashbord/sidebar";
import Header from "./dashbord/header";
import Footer from "./dashbord/footer";
import VirtualAgentButton from "../components/VirtualAgent/VirtualAgentButton";

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // 1. Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (userData) {
      setCurrentUser(userData);
    } else {
      // Redirect to login if no user data exists (e.g., direct URL access)
      navigate("/login");
    }
  }, [navigate]);

  // 2. Optional: Protect routes by role (e.g., admin-only pages)
  // useEffect(() => {
  //   if (currentUser?.u_role !== "admin") {
  //     navigate("/unauthorized");
  //   }
  // }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007B98]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7ED] dashboard-layout flex">
      {/* Pass user data to Sidebar for role-based menu items */}
      <Sidebar user={currentUser} />

      <div className="dashboard-content w-full">
        {/* Pass user data to Header (e.g., display name, avatar) */}
        <Header user={currentUser} />

        {/* Main content area with role-based background (using user's roleColors) */}
        <div className="min-h-[calc(100vh-64px)] p-4" >
          <Outlet /> {/* Child routes render here */}
        </div>

        <VirtualAgentButton />
      </div>

      {/* Pass user role to Footer for conditional rendering */}
      <Footer role={currentUser.u_role} />
    </div>
  );
}

export default Dashboard;