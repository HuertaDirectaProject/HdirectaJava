import LoginDesktop from "../../components/Auth/LoginDesktop";
import { LoginMobile } from "../../components/Auth/LoginMobile";



const Login = () => {
  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden">
        <LoginMobile />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <LoginDesktop />
      </div>
    </>
  );
};

export default Login;