import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { 
  AiOutlinePlus, 
  AiOutlineUnorderedList, 
  AiOutlineShoppingCart, 
  AiOutlineUser, 
  AiOutlineCalendar, 
  AiOutlineTeam, 
  AiOutlineLogout 
} from 'react-icons/ai';
import { useI18n } from '../../i18n/context';

const Sidebar = () => {
  const { t } = useI18n() || { t: (k) => k };

  return (
    <div className='sidebar'>
      {/* Top links */}
      <div className="sidebar-options">
         
        <NavLink to='/dashboard' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
            <AiOutlinePlus className="sidebar-icon"/>
            <p>{t('Dashboard') || 'Dashboard'}</p>
        </NavLink>
        <NavLink to='/add' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
            <AiOutlinePlus className="sidebar-icon"/>
            <p>{t('addItems') || 'Add Items'}</p>
        </NavLink>
        <NavLink to='/list' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
            <AiOutlineUnorderedList className="sidebar-icon"/>
            <p>{t('listItems') || 'List Items'}</p>
        </NavLink>
        <NavLink to='/orders' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
            <AiOutlineShoppingCart className="sidebar-icon"/>
            <p>{t('orders') || 'Orders'}</p>
        </NavLink>
        <NavLink to='/reservation' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
            <AiOutlineCalendar className="sidebar-icon"/>
            <p>{t('reservation') || 'Reservation'}</p>
        </NavLink>
    <NavLink to='/user' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
  <AiOutlineUser className="sidebar-icon"/>
  <p>{t('user') || 'User'}</p>
    </NavLink>
        <NavLink to='/supplier' className={({isActive}) => isActive ? 'sidebar-option active' : 'sidebar-option'}>
            <AiOutlineTeam className="sidebar-icon"/>
            <p>{t('supplier') || 'Supplier'}</p>
        </NavLink>
      </div>

      {/* Bottom fixed section */}
    <div className="sidebar-bottom">
      <div className="sidebar-option logout-option" onClick={() => {
          // Clear admin auth and redirect back to the public frontend login page
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // safe default frontend URL - adjust if frontend runs on a different port
          const frontendLogin = 'http://localhost:5173';
          try { window.location.assign(frontendLogin); } catch (e) { window.location.assign('/'); }
        }}>
        <AiOutlineLogout className="sidebar-icon"/>
        <p>{t('logout') || 'Logout'}</p>
      </div>
    </div>
    </div>
  )
}

export default Sidebar;
