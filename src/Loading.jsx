
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from '/image/logo.png';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <img src={logo} alt="Logo" className="loading-logo" />
      <div className="loading-animation">
        <DotLottieReact
          src="https://lottie.host/6452f558-ef1b-419a-b8cc-6e95f5b371d7/qUSSW87yM2.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
};

export default Loading;
