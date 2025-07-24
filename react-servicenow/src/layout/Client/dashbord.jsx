import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./dashbord/sidebar";
import Header from "./dashbord/header";
import Footer from "./dashbord/footer";
import VirtualAgentButton from "../../views/Client/components/VirtualAgent/VirtualAgentButtonUser";

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const scrollContainerRef = useRef(null);
  const lastScrollTop = useRef(0);
  const scrollDownDistance = useRef(0);
  const hideTimeout = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (userData) {
      setCurrentUser(userData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const THRESHOLD = 50; // pixels to scroll down before hiding
    const DELAY = 300; // ms delay before hiding header

    const handleScroll = () => {
      const scrollTop = scrollContainerRef.current.scrollTop;

      if (scrollTop > lastScrollTop.current) {
        // Scrolling down
        scrollDownDistance.current += scrollTop - lastScrollTop.current;

        if (scrollDownDistance.current > THRESHOLD && showHeader) {
          // Clear any existing timeout to avoid duplicates
          if (hideTimeout.current) clearTimeout(hideTimeout.current);

          // Delay hiding header
          hideTimeout.current = setTimeout(() => {
            setShowHeader(false);
          }, DELAY);
        }
      } else {
        // Scrolling up
        scrollDownDistance.current = 0;
        if (hideTimeout.current) {
          clearTimeout(hideTimeout.current);
          hideTimeout.current = null;
        }
        if (!showHeader) setShowHeader(true);
      }

      lastScrollTop.current = scrollTop;
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [showHeader]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007B98]"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout flex">
      <Sidebar user={currentUser} />
      <div className="dashboard-content w-full flex flex-col h-screen">
        {showHeader && <Header user={currentUser} />}

        <div
          className="flex-1 overflow-y-auto px-4 py-2"
          ref={scrollContainerRef}
        >
          <Outlet user={currentUser} />
          <VirtualAgentButton />
          
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard;