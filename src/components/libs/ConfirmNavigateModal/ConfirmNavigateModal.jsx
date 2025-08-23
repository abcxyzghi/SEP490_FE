import React from "react";
import './ConfirmNavigateModal.css';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import defaultIcon from "../../../assets/Icon_line/check_ring_round.svg";

export default function ConfirmNavigateModal({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Click outside to cancel",
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    return (
        <Dialog
            className="confirmNavigateDialog-container"
            open={open}
            onClose={onCancel}
            fullWidth
            maxWidth="xs"
            PaperProps={{ className: 'confirmNavigateDialog-animated-shadow' }}
        >
            <div className="confirmNavigateDialog-box">
                <div className="confirmNavigateDialog-header">
                    <div className="confirmNavigateDialog-title oxanium-semibold">{title}</div>

                    <img
                        src={defaultIcon}
                        alt={'success icon'}
                        className='confirmNavigateDialog-header-icon'
                    />
                </div>

                <DialogContent sx={{ textAlign: 'center', padding: 0 }}>
                    <div className="confirmNavigateDialog-message oxanium-regular">{message}</div>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', paddingTop: '1.5rem' }}>
                    <button
                        onClick={onConfirm}
                        className="confirmNavigateDialog-button oxanium-bold"
                    >
                        {confirmLabel}
                    </button>
                </DialogActions>

                <div className="confirmNavigateDialog-footer oxanium-semibold">
                    {cancelLabel}
                </div>

            </div>
        </Dialog>
    );
}
