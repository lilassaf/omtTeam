// Dashboard.jsx
import { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "./dashbord/sidebar";
import Header from "./dashbord/header";

function Dashboard() {
    const [open, setOpen] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarhovered, setIsSidebarhovered] = useState(false);
    const handleMouseEnter = () => setIsSidebarhovered(false); // Expand on hover
    const handleMouseLeave = () => setIsSidebarhovered(true);  // Collapse when mouse leaves
    
   
    useEffect(() => {
       if (!isSidebarCollapsed) setOpen(isSidebarhovered || isSidebarCollapsed);
    }, [isSidebarhovered, isSidebarCollapsed]);


    return (
        <div className="dashboard-layout flex w-screen h-screen relative">
            <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Sidebar
                    open={open}
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>
            <div className="dashboard-content w-full flex flex-col">
                <Header />
                <div className="bg-gray-100/50 flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
           
        </div>
    );
}

export default Dashboard;