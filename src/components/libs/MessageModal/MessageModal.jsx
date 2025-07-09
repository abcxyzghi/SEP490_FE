import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import './MessageModal.css';
// import icon
import defaultIcon from "../../../assets/Icon_line/check_ring_round.svg";
import warningIcon from "../../../assets/Icon_line/Info.svg";
import errorIcon from "../../../assets/Icon_line/warning-error.svg";

export default function MessageModal({ open, onClose, type = 'default', title, message }) {
  const getIconByType = (type) => {
    switch (type) {
      case 'warning':
        return warningIcon;
      case 'error':
        return errorIcon;
      default:
        return defaultIcon;
    }
  };

  return (
    <Dialog
      className={`messageDialog-container ${type}`} // type: 'default' | 'warning' | 'error'
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ className: 'messageDialog-animated-shadow' }}
    >
      <div className="card__border"></div>

      <div className="messageDialog-box">
        <div className="messageDialog-header">
          <div className="messageDialog-title oxanium-semibold">{title}</div>

          <img
            src={getIconByType(type)}
            alt={`${type} icon`}
            className='messageDialog-header-icon'
          />
        </div>

        <DialogContent sx={{ textAlign: 'center', padding: 0 }}>
          <div className="messageDialog-message oxanium-regular">{message}</div>
        </DialogContent>

        <div className="messageDialog-footer oxanium-bold">
          Click elsewhere to continue
        </div>
      </div>
    </Dialog>
  );
}
