import React from "react";
import "./styles.css";

const ErrorComponent = ({ typeError, setIsError }) => {
  return (
    <div className="errorContainer">
      <div className="closeLine">
        <div className="crossStyle" onClick={() => setIsError({})}>
          X
        </div>
      </div>
      <h3>{typeError}</h3>
    </div>
  );
};

export default ErrorComponent;
