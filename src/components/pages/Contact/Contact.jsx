import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';
import IssueDetails from '../../../assets/Icon_line/Add_square.svg';
import { useSelector } from 'react-redux';
import { getProfile } from '../../../services/api.user';
import MessageModal from '../../libs/MessageModal/MessageModal';

export default function Contact() {
    const [activeIssues, setActiveIssues] = useState([]);
    const [textareaValue, setTextareaValue] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });

    const userFlag = useSelector((state) => state.auth.user);
    const form = useRef();

    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const issues = [
        { text: "Slow performance", icon: IssueDetails },
        { text: "Sync errors", icon: IssueDetails },
        { text: "Image glitch", icon: IssueDetails },
        { text: "Data loss", icon: IssueDetails },
        { text: "Free feature limitations", icon: IssueDetails },
        { text: "Formatting issues", icon: IssueDetails },
        { text: "Weak search functionality", icon: IssueDetails },
    ];

    const handleIssueClick = (issueText) => {
        let updatedIssues;

        if (activeIssues.includes(issueText)) {
            // Remove the issue if it's already selected
            updatedIssues = activeIssues.filter(issue => issue !== issueText);
        } else {
            // Add the new issue
            updatedIssues = [...activeIssues, issueText];
        }

        setActiveIssues(updatedIssues);

        // Format the textarea content with selected issues
        const formattedText = updatedIssues.map(issue => `*${issue}*`).join(" ");

        setTextareaValue(formattedText);
    };


    // Fetch user profile on mount
    useEffect(() => {
        async function fetchProfile() {
            if (!userFlag || userFlag.role !== 'user') return; // only fetch if logged in

            setLoadingProfile(true);
            try {
                const res = await getProfile();
                if (res?.status && res.data) {
                    // setUser(res.data);
                    setName(res.data.username || "");
                    setEmail(res.data.email || "");
                }
            } catch (err) {
                // console.error("Failed to fetch profile:", err);
                setUser(null);
            } finally {
                setLoadingProfile(false);
            }
        }

        fetchProfile();
    }, [userFlag]);


    const showModal = (type, title, message) => {
        setModal({ open: true, type, title, message });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if required fields are filled
        if (!name || !email || !textareaValue) {
            showModal('warning', 'Missing Fields', 'Please fill out all required fields!');
            return;
        }

        setLoadingBtn(true);

        emailjs
            .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
                publicKey: PUBLIC_KEY,
            })
            .then(
                () => {
                    showModal('default', 'Email Sent', 'Thank you for your time. We appreciate your feedback and support.');
                    setActiveIssues([]);
                    setTextareaValue('');
                    // Only clear name/email if not autofilled
                    if (!userFlag || userFlag.role !== 'user') {
                        setName('');
                        setEmail('');
                    }
                },
                (error) => {
                    showModal('error', 'Send Failed', 'Failed to send email. Please try again later.');
                }
            )
            .finally(() => {
                setLoadingBtn(false);
            });
    };

    return (
        <div className='contact-container'>
            <div className="contact-content">
                <p className='contactUs-title oleo-script-bold'>Contact us</p>
                <p className='contactUs-description oleo-script-regular'>
                    If you have any questions, suggestions, or issues, please feel free to reach out to us.
                    We value your feedback and are here to help!
                </p>
            </div>

            <div className="contact-table">
                <div className="contact-issues-table">
                    <h4 className='oxanium-bold'>Suggestion board 🗯️</h4>
                    <div className="contact-issues-grid oxanium-regular">
                        {issues.map((issue, index) => (
                            <button
                                key={index}
                                onClick={() => handleIssueClick(issue.text)}
                                className={activeIssues.includes(issue.text) ? 'active' : ''}
                            >
                                {issue.icon && (
                                    <img
                                        src={issue.icon}
                                        alt={'IssueDetails Icon'}
                                        className="contact-issue-icon"
                                    />
                                )}
                                {issue.text}
                            </button>
                        ))}
                    </div>
                </div>

                <form ref={form} className='oxanium-regular' onSubmit={handleSubmit}>
                    <div className="contact-issues-textarea">
                        <label htmlFor="detail">More detail</label>
                        <textarea
                            id="detail"
                            name="message"
                            className='textarea-box'
                            placeholder="Tell us what's on your mind"
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                        />
                    </div>

                    <label htmlFor="name"><span className="asterisk">*</span> Your name</label>
                    <input
                        type="text"
                        id="name"
                        name="user_name"
                        placeholder="How can we call you"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        readOnly={!!userFlag} // if logged in, make it readOnly
                    />

                    <label htmlFor="email"><span className="asterisk">*</span> E-mail address</label>
                    <input
                        type="email"
                        id="email"
                        name="user_email"
                        placeholder="Your email so we may have futher contact"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        readOnly={!!userFlag} // if logged in, make it readOnly
                    />

                    <button type="submit" disabled={loadingBtn}>
                        {loadingBtn ? <span className="loading loading-bars loading-md"></span> : "Send"}
                    </button>
                </form>
            </div>

            {/* MessageModal for feedback */}
            <MessageModal
                open={modal.open}
                onClose={() => setModal(prev => ({ ...prev, open: false }))}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />
        </div>
    )
}
