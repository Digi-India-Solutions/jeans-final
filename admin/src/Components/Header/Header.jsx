import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [sidetoggle, setSideToggle] = useState(false);

  const handletoggleBtn = () => {
    setSideToggle(!sidetoggle);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('login');
    // navigate('/login');
    window.location.href = '/login';
  };

  const navItems = [
    { to: "/", label: "Dashboard", icon: "fa-solid fa-gauge" },
    { to: "/all-orders", label: "Manage Orders", icon: "fa-solid fa-truck" },
    { to: "/all-cards", label: "All Cards", icon: "fa-solid fa-star" },
    { to: "/all-dieses", label: "All Category", icon: "fa-solid fa-virus" },
    { to: "/all-products", label: "All Products", icon: "fa-solid fa-boxes" },
    { to: "/all-banners", label: "Manage Banners", icon: "fa-solid fa-images" },
    { to: "/all-size", label: "Manage Size", icon: "fa-solid fa-heartbeat" },
    { to: "/all-color", label: "Manage Color", icon: "fa-solid fa-heartbeat" },
    { to: "/all-coupen", label: "Manage Coupens", icon: "fa-solid fa-tag" },
    { to: "/all-users", label: "All Users", icon: "fa-solid fa-users" },
    { to: "/all-wishlist", label: "manage user wishlist", icon: "fa-solid fa-brain" },
    { to: "/all-rewardPoint", label: "Manage Reward Point", icon: "fa-solid fa-coins" },
    { to: "/all-videos", label: "Manage Videos", icon: "fa-solid fa-video" },
    { to: "/all-faq", label: "Manage Faq", icon: "fa-solid fa-pen" },
    { to: "/all-reviews", label: "All Reviews", icon: "fa-solid fa-star" },

    // { to: "/news-letter", label: "News Letter", icon: "fa-solid fa-newspaper" },
  ];

  return (
    <header>
      <div className="top-head">
        <div className="right">
          <Link className='text-white text-decoration-none' to="/">
            <h2>Anibhavi Creation Admin Panel</h2>
          </Link>
          <div className="bar" onClick={handletoggleBtn}>
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>
        <div className="left">
          <a href="https://manovedya.vercel.app/" target="_blank" rel="noopener noreferrer">
            <i className="fa-solid fa-globe"></i> Go To Website
          </a>
          <div className="logout" onClick={handleLogout}>
            Log Out <i className="fa-solid fa-right-from-bracket"></i>
          </div>
        </div>
      </div>

      <div className={`rightNav ${sidetoggle ? "active" : ""}`}>
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.to} onClick={handletoggleBtn}>
                <i className={item.icon}></i> {item.label}
              </Link>
            </li>
          ))}
          <div className="logout" onClick={handleLogout}>
            Log Out <i className="fa-solid fa-right-from-bracket"></i>
          </div>
        </ul>
      </div>
    </header>
  );
};

export default Header;
