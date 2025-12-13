import { useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { closeMenu } from "../../../js/main.js";
import { useNavigate } from "react-router-dom";

function Header() {
  const CardBtnRef = useRef(null);
  const userCardRefDesktop = useRef(null);
  const [isDesktopUserCardOpen, setIsDesktopUserCardOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const handleLogout = async () => {
    const ok = await logout(); // AuthContext handles redirect
    if (ok) navigate("/login");
  };

  const ToggleDesktopUserCard = () => {
    setIsDesktopUserCardOpen((prev) => !prev);
  };

  return (
    <div className="headerToMainsection">
      <div className="headerMain">
        {/* ======================= DESKTOP HEADER ======================= */}
        <div className="desktop_header">

          {/* LOGO + NAME */}
          <div className="logoandName">
            <Link to="/">
              <img src={user?.companyLogo ?? ""} alt="logo" />
            </Link>
            <h1>{user?.companyName ?? "Fortune"}</h1>
          </div>

          {/* NAV LINKS */}
          <div className="pagesLink">
            <ul>
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? "activemanue" : undefined)}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => (isActive ? "activemanue" : undefined)}>
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/product/666ad8c978581969a68645ac"
                  className={({ isActive }) => (isActive ? "activemanue" : undefined)}
                >
                  Product
                </NavLink>
              </li>
              <li>
                <NavLink to="/cart" className={({ isActive }) => (isActive ? "activemanue" : undefined)}>
                  Cart
                </NavLink>
              </li>
            </ul>
          </div>

          {/* USER PROFILE DROPDOWN */}
          <div className="CartAndProfile">
            <div className="userProfileMain">
              {/* User Avatar */}
              {user?.employeeProfile ? (
                <img
                  src={user.employeeProfile}
                  alt="profile"
                  onClick={ToggleDesktopUserCard}
                  ref={CardBtnRef}
                  className="personAvaterImage"
                />
              ) : (
                <PersonIcon className="personAvaterinProfile" onClick={ToggleDesktopUserCard} ref={CardBtnRef} />
              )}

              {/* Dropdown Card */}
              <div
                className={`userProfileToggle ${isDesktopUserCardOpen ? "toggleUserCard" : ""}`}
                ref={userCardRefDesktop}
              >
                <div className="profileNameAndlogo">
                  {user?.employeeProfile ? (
                    <img src={user.employeeProfile} alt="profile" className="personAvaterImageInner" />
                  ) : (
                    <PersonIcon className="personAvaterinProfile" />
                  )}

                  {/* Greeting */}
                  {!!user?.companyName ? (
                    <div className="unLogUserinCard">
                      <h2 className="userNameinCard">Dear User,</h2>
                      <h2 className="userMessageInCard">Login or Register Please! 👇🏼</h2>
                    </div>
                  ) : (
                    <h2>{user?.employeeName ?? "User"}</h2>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                {!user?.companyName ? (
                  <div className="loginInnerContainer">
                    <Link to="/login">
                      <div className="loginOut_in">Login</div>
                    </Link>
                    <Link to="/register">
                      <div className="loginOut_in registerIncard">Register</div>
                    </Link>
                  </div>
                ) : (
                  <div className="loginInnerContainer">
                  <Link to={`/theemployee/${user?.employeeId}`} className="employeeViewProfile">View</Link>
                  <div className="loginOut_out" onClick={handleLogout} style={{ alignSelf: "flex-end" }}>
                    Logout
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================= MOBILE HEADER ======================= */}
        <div className="mobile_header">
          <div className="mobileNavbutton">
            <MenuIcon onClick={closeMenu} />
          </div>

          {/* MOBILE MENU */}
          <div className="mobile_menu">
            <CloseIcon onClick={closeMenu} />

            <div className="pagesLink">
              <ul>
                <li>
                  <NavLink to="/" end className={({ isActive }) => (isActive ? "activemanue" : undefined)} onClick={closeMenu}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className={({ isActive }) => (isActive ? "activemanue" : undefined)} onClick={closeMenu}>
                    Contact
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/cart" className={({ isActive }) => (isActive ? "activemanue" : undefined)} onClick={closeMenu}>
                    Cart
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>

          {/* MOBILE LOGO */}
          <div className="logoandName">
            <Link to="/">
              <img src={user?.companyLogo ?? ""} alt="logo" />
            </Link>
            <h1>{user?.companyName ?? "Fortune"}</h1>
          </div>

          {/* MOBILE LOGIN/LOGOUT */}
          <div className="CartAndProfile">
            {!user ? (
              <Link to="/login">
                <div className="loginOut_in">Login</div>
              </Link>
            ) : (
              <div className="loginOut_out" onClick={handleLogout}>
                Logout
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
