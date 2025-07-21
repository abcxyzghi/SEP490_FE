// components/DropdownMenu.jsx
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import './DropdownMenu.css'; // Import your styles here

export default function DropdownMenu({ anchorRef, children, isOpen, onClose }) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef();

    useEffect(() => {
        if (isOpen && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }
    }, [isOpen, anchorRef]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                isOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !anchorRef.current.contains(e.target)
            ) {
                onClose?.();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                zIndex: 9999,
            }}
            className="dropdown-menu-container"
            onMouseEnter={() => { }} // Required to prevent flicker
            onMouseLeave={onClose}  // Closes when mouse leaves
        >
            {children}
        </div>,
        document.body
    );
}