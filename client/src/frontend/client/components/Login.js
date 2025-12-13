import { useEffect, useRef, useState } from 'react'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

function Login() {

  const [userdata, SetuserData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [resMsgStyle, setResMsgStyle] = useState({});
  const [inVisible, setIsVisible] = useState(false);
  const [toggleButton, setToggleButton] = useState(true);

  const passwordOne = useRef(null);
  const passwordContainer = useRef(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Enable button only when email + password exist
  useEffect(() => {
    setToggleButton(!(userdata.email && userdata.password));
  }, [userdata.email, userdata.password]);

  // Handle input
  const getData = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    const label = e.currentTarget.previousElementSibling;

    if (value !== "") {
      label.style.display = "block";
      if (name === "password") {
        passwordContainer.current.style = `top:38px`;
      }
    } else {
      label.style.display = "none";
      if (name === "password") {
        passwordContainer.current.style = `top:21px`;
      }
    }

    SetuserData({ ...userdata, [name]: value });
  };

  // Toggle Password Visibility
  const TogglePass = () => {
    if (inVisible) {
      passwordOne.current.type = "password";
      setIsVisible(false);
    } else {
      passwordOne.current.type = "text";
      setIsVisible(true);
    }
  };

  // Login Handler
  const SignIn = async () => {
    setLoading(true);
    setToggleButton(true);
    try {
      const user = await login(userdata.email, userdata.password);
      setResMessage("Login Successful!");
      setResMsgStyle({ color: "green", opacity: 1, marginTop: "15px" });
      SetuserData({ email: "", password: "" });
      setTimeout(() => {
        setResMsgStyle({ opacity: 0 });
        navigate(`/company/${user.companyName}`);
      }, 1200);

    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong!";
      setResMessage(msg);
      setResMsgStyle({ color: "red", opacity: 1, marginTop: "15px" });
      setTimeout(() => setResMsgStyle({ opacity: 0 }), 2000);
    } finally {
      setLoading(false);
      setToggleButton(false);
    }
  };

  return (
    <div className="contactContainerMain">
      <div className="contactinnerMain">
        
        <div className='regLogtopTwo'>
          <h2>Login Here</h2>
          <Link to="/register">Register</Link>
        </div>

        <div className='contactInner'>

          <label htmlFor='log_email'>
            <span className='userinfotextdemo'>Email</span>
            <input type="text" 
              name="email" 
              autoComplete="off" 
              id="log_email" 
              placeholder="Enter your Email.."  
              onChange={getData} 
              className='contactinput'
            />
          </label>

          <div className="passwordPr">
            <label htmlFor='passOneInLog' className="passwordContinerLabel">
              <span className='userinfotextdemo'>Password</span>
              <input type="password"
                ref={passwordOne}
                name="password"
                autoComplete="off"
                id="passOneInLog"
                placeholder="Enter password"
                onChange={getData}
                className='contactinput LogregsiterpassInput'
              />
            </label>

            <div className="passBtnlog" ref={passwordContainer}>
              <VisibilityOutlinedIcon className="allPassBtn"
                onClick={TogglePass}
                style={{ display: `${!inVisible ? 'block' : 'none'}` }}
              />
              <VisibilityOffOutlinedIcon className="allPassBtn"
                onClick={TogglePass}
                style={{ display: `${inVisible ? 'block' : 'none'}` }}
              />
            </div>
          </div>

          <button className='contactsendbtn'
            disabled={toggleButton}
            onClick={SignIn}
          >
            {loading ? "Trying..." : "Login"}
          </button>

          <div className='showErrorOrSuccess' style={resMsgStyle}>
            {resMessage}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
