import React from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import './ConfirmModal.css';
import warningIcon from "../../../assets/Icon_line/Info.svg";


export default function ConfirmModal({ open, onClose, onConfirm, title, message }) {
    return (
        <Dialog
            className="confirmDialog-container"
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ className: 'confirmDialog-animated-shadow' }}
        >
            <div className="card__border"></div>

            <div className="confirmDialog-box">
                <div className="confirmDialog-header">
                    <div className="confirmDialog-title oxanium-semibold">{title}</div>

                    <img
                        src={warningIcon}
                        alt={'warningIcon icon'}
                        className='confirmDialog-header-icon'
                    />
                </div>

                <DialogContent sx={{ textAlign: 'center', padding: 0 }}>
                    <div className="messagconfirmDialogeDialog-message oxanium-regular">{message}</div>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', paddingBottom: '1.5rem' }}>
                    <Button
                        onClick={onConfirm}
                        className="confirmDialog-button oxanium-bold"
                        variant="contained"
                        color="primary"
                    >
                        Confirm
                    </Button>
                </DialogActions>

                <div className="messageDialog-footer oxanium-regular">
                    Click elsewhere to cancel
                </div>
            </div>
        </Dialog>
    );
}
