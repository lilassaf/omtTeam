import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFound from '../views/error/index'; // adjust path as needed

const ContactRoute = () => {
  const userInfo = useSelector(state => state.auth.userInfo);
  localStorage.setItem('userInfo',userInfo.role);

  // Not logged in → show nothing or login redirect
  if (!userInfo) return null;

  // Not admin → show 404 content directly
  if (userInfo.role?.toLowerCase() !== 'contact') return null;

  return <Outlet />;
};

export default ContactRoute;
