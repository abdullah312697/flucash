import { useRef, useState } from "react";
import { Altaxios } from "../../Altaxios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext';

const EmailVerify = () => {
  const [msgStyle, setMsgStyle] = useState({});
  const [errMsg, setErrMsg] = useState("");
  const [isCheckEmpty, setIsCheckEmpty] = useState(true);
  const [isResend, setIsResend] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const {user} = useAuth();
  const navigate = useNavigate();

  // ⬇️ Array of 6 input refs
  const inputsRef = useRef([]);
  // Load localStorage data safely

  // Update empty validation
  const updateCheckEmptyState = () => {
    const isEmpty = inputsRef.current.some(
      (input) => !input || input.value.trim() === ""
    );
    setIsCheckEmpty(isEmpty);
  };

  // Move focus backwards
  const backRet = (e) => {
    if (e.keyCode === 8 && e.target.value === "") {
      const index = inputsRef.current.indexOf(e.target);
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
    updateCheckEmptyState();
  };

  // Handle input change (only one digit)
  const getVFCode = (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 1);

    const index = inputsRef.current.indexOf(e.target);
    if (e.target.value !== "" && index < 5) {
      inputsRef.current[index + 1].focus();
    }

    updateCheckEmptyState();
  };

  // Start countdown
  const startCountdown = () => {
    setCountdown(60);
    setIsResend(true);

    let timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setIsResend(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend code
  const reSendCode = async () => {
    try {
      startCountdown();

      // Clear all inputs
      inputsRef.current.forEach((input) => {
        if (input) input.value = "";
      });
      updateCheckEmptyState();

      // Generate random 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000);

      const res = await Altaxios.put("/users/updateVfCode", {
        verifyCode: code,
      });

      if (res.status === 200) {
        setErrMsg(res.data.message);
        setMsgStyle({ opacity: 1, color: "green" });
        setTimeout(() => {
          setMsgStyle({ opacity: 0 });
        }, 3000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Verify the full code
  const getAllWithCode = async () => {
    setIsCheckEmpty(true);

    const verifyCode = inputsRef.current
      .map((input) => input?.value || "")
      .join("");

    try {
      const response = await Altaxios.post("/users/verifyCode", {
        verifyCode,
      });

      setErrMsg(response.data.message);
      setMsgStyle({ opacity: 1, color: "green" });

      setTimeout(() => {
        navigate(`/company/${user.companyName ?? "fortune"}`);
        setMsgStyle({ opacity: 0 });
      }, 3000);
    } catch (err) {
      if (err.response) {
        setErrMsg(err.response.data.message);
        setMsgStyle({ opacity: 1, color: "red" });
        setTimeout(() => {
          setMsgStyle({ opacity: 0 });
        }, 3000);
            setIsCheckEmpty(false);
      } else {
        console.log(err);
      }
    }
  };

  return (
    <div className="contactContainerMain">
      <div className="contactinnerMain">
        <h2 className="emailVerifyheadding">Verify Your Email Address</h2>

        <div className="verifyEmail">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="number"
              placeholder="X"
              name="vfCodeOne"
              className="vfInput"
              onKeyDown={backRet}
              onChange={getVFCode}
              ref={(el) => (inputsRef.current[i] = el)}
            />
          ))}
        </div>

        <div className="resendVfcode">
          <input
            type="button"
            className="verifyEmailRsbtn"
            value="Resend"
            onClick={reSendCode}
            disabled={isResend}
          />
          <span className="isResendCountDown">
            {isResend ? `${countdown}s` : ""}
          </span>

          <div className="showMsg" style={msgStyle}>
            {errMsg}
          </div>

          <input
            type="button"
            className="verifyEmailVfbtn"
            value="Verify"
            disabled={isCheckEmpty}
            onClick={getAllWithCode}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;
