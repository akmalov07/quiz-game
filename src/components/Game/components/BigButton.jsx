import React from "react";
import { cx } from "../utils/helpers";

export default function BigButton({ onClick, variant, icon: Icon, children, disabled, small }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx("qg-btn", `qg-btn--${variant}`, small && "qg-btn--small")}
    >
      {Icon && <Icon size={small ? 18 : 20} />} {!small && children}
    </button>
  );
}
