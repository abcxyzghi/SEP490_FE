import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Step,
  StepLabel,
  Stepper
} from "@mui/material";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useRef, useState } from "react";
import "./HostAuctionModal.css";
dayjs.extend(utc);
dayjs.extend(tz);

import { cancelAuction, fetchMyAuctionList, newAuction, productOfAuction } from "../../../services/api.auction";
import MessageModal from "../MessageModal/MessageModal";

/* -------------------- Custom Step Connector (same pattern as ForgotPasswordDialog) -------------------- */
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { getAllProductOfUserCollection } from "../../../services/api.user";

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#3b3b45",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")(({ ownerState }) => ({
  color: "#9ca3af",
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState.active && {
    color: "#784af4",
  }),
  "& .QontoStepIcon-completedIcon": {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
  "& .QontoStepIcon-circle": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
}));

function QontoStepIcon(props) {
  const { active, completed } = props;
  return (
    <QontoStepIconRoot ownerState={{ active }}>
      {completed ? <span className="QontoStepIcon-completedIcon">✓</span> : <div className="QontoStepIcon-circle" />}
    </QontoStepIconRoot>
  );
}

export default function HostAuctionModal({ open, onClose, productId, onSuccess, collectionId, product }) {
  const [activeStep, setActiveStep] = useState(0);
  const nextLockRef = useRef(false);
  const step1SnapshotRef = useRef(null);

  // step1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(""); // datetime-local value

  // step2
  const [quantity, setQuantity] = useState(1);
  const [startingPrice, setStartingPrice] = useState(1000);

  // internal
  const [creating, setCreating] = useState(false);
  const [fetchingLatest, setFetchingLatest] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [modal, setModal] = useState({ open: false, type: "default", title: "", message: "" });
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [createdAuctionId, setCreatedAuctionId] = useState(null);
  const [createdAuctionObj, setCreatedAuctionObj] = useState(null);

  const steps = ["Create auction", "Attach product"];

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setTitle("");
      setDescription("");
      setStartTime("");
      setQuantity(1);
      setStartingPrice(1000);
      setCreating(false);
      setFetchingLatest(false);
      setAssigning(false);
      setModal({ open: false, type: "default", title: "", message: "" });
      setCreatedAuctionId(null);
      setCreatedAuctionObj(null);
      step1SnapshotRef.current = null;
      nextLockRef.current = false;
    }
  }, [open]);

  // fetchLatestAuction
  const fetchLatestAuction = async (trustServerOrder = true) => {
    setFetchingLatest(true);
    try {
      const res = await fetchMyAuctionList();
      const raw = res?.data || res;
      let items = [];
      if (Array.isArray(raw)) items = raw;
      else if (Array.isArray(raw.data)) items = raw.data;
      else if (Array.isArray(raw.data?.data)) items = raw.data.data;
      else if (Array.isArray(res?.data?.auctions)) items = res.data.auctions;
      if (!items || items.length === 0) return null;

      if (trustServerOrder) return items[items.length - 1];

      const withTime = items.filter((a) => a?.start_time);
      if (withTime.length) {
        const latest = withTime.reduce((acc, cur) => {
          const ta = new Date(acc.start_time).getTime() || 0;
          const tc = new Date(cur.start_time).getTime() || 0;
          return tc > ta ? cur : acc;
        }, withTime[0]);
        return latest;
      }
      return items[items.length - 1];
    } catch (err) {
      console.error("fetchMyAuctionList error:", err);
      return null;
    } finally {
      setFetchingLatest(false);
    }
  };

  const displayTime = (isoLike) => {
    const s = isoLike && String(isoLike).trim();
    if (!s) return "-";
    let parsed;
    if (s.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(s)) {
      parsed = dayjs.utc(s).tz("Asia/Ho_Chi_Minh");
    } else {
      parsed = dayjs(s);
    }
    return parsed.format("YYYY-MM-DD HH:mm");
  };

  const closeModal = async () => {
    if (createdAuctionId) {
      const tempResponse = await cancelAuction(createdAuctionId);
      if (!tempResponse || tempResponse.message) {
        setModal({ open: true, type: "error", title: "Cancel Auction Error", message: "Failed to cancel existing auction. Please try again." });
        return;
      }
    }
    onClose();
  };

  // Guarded Next (create auction and fetch latest)
  const handleNext = async () => {
    setModal({ open: false, type: "default", title: "", message: "" });
    if (new Date(startTime).getTime() <= Date.now()) {
      setModal({ open: true, type: "warning", title: "Invalid Start Time", message: "Start time cannot be in the past." });
      return;
    }

    if (nextLockRef.current) return;
    nextLockRef.current = true;

    try {
      if (activeStep !== 0) return;

      // validation
      if (!title?.trim()) {
        setModal({ open: true, type: "warning", title: "Missing Title", message: "Please enter auction title." });
        return;
      }
      if (!description?.trim()) {
        setModal({ open: true, type: "warning", title: "Missing Description", message: "Please enter auction description." });
        return;
      }
      if (!startTime) {
        setModal({ open: true, type: "warning", title: "Missing Start Time", message: "Please set a start time." });
        return;
      }

      // if already created and inputs unchanged -> reuse

      const snapshot = step1SnapshotRef.current;
      const unchanged = snapshot && snapshot.title === title && snapshot.description === description && snapshot.startTime === startTime;
      if (createdAuctionId) {
        if (unchanged) {
          setActiveStep(1);
          return;
        }
        const tempResponse = await cancelAuction(createdAuctionId);
        if (!tempResponse || tempResponse.message) {
          setModal({ open: true, type: "error", title: "Cancel Auction Error", message: "Failed to cancel existing auction. Please try again." });
          return;
        }
      }

      setCreating(true);
      const iso = new Date(startTime).toISOString();
      const createRes = await newAuction({
        title: title.trim(),
        description: description.trim(),
        start_time: iso,
      });

      const fallbackId = createRes?.data?.id || createRes?.data?.auction_session_id || createRes?.data?.auctionId || null;

      // fetch latest
      const latest = await fetchLatestAuction(true);

      let chosen = null;
      if (latest && (latest.id || latest._id)) chosen = latest;
      else if (fallbackId) chosen = createRes?.data || { id: fallbackId, title, start_time: iso };

      if (!chosen) {
        setModal({ open: true, type: "error", title: "Auction Error", message: "Created auction but not found. Try again." });
        return;
      }

      const id = chosen.id || chosen._id;
      console.log("Auction created:", id);
      console.log("Latest auction fetched:", chosen);
      setCreatedAuctionId(id);
      setCreatedAuctionObj(chosen);

      step1SnapshotRef.current = { title, description, startTime };

      setActiveStep(1);
    } catch (err) {
      console.error("newAuction error", err);
      // Check for specific error response from API
      const apiError = err?.response?.data || err;
      if (apiError && apiError.error === "multiple auction create has been restricted !") {
        setModal({
          open: true,
          type: "error",
          title: "Auction Restricted",
          message: "You have create multiple auction please wait for moderator approval before create another one",
        });
      } else {
        setModal({ open: true, type: "error", title: "Auction Error", message: "Failed to create auction. Please try again." });
      }
    } finally {
      setCreating(false);
      nextLockRef.current = false;
    }
  };

  const handleBack = () => {
    setModal({ open: false, type: "default", title: "", message: "" });
    if (activeStep === 1) setActiveStep(0);
  };

  const handleSubmitAssignment = async () => {
    setModal({ open: false, type: "default", title: "", message: "" });

    const auctionIdToUse = createdAuctionId;
    if (!auctionIdToUse) {
      setModal({ open: true, type: "error", title: "Auction Error", message: "Auction session ID not found. Please create auction again." });
      return;
    }
    if (!productId) {
      setModal({ open: true, type: "error", title: "Product Error", message: "Product ID missing. Please re-open modal from product list." });
      return;
    }
    if (!quantity || quantity < 1) {
      setModal({ open: true, type: "warning", title: "Invalid Quantity", message: "Quantity must be at least 1." });
      return;
    }
    if (!startingPrice || startingPrice < 1000) {
      setModal({ open: true, type: "warning", title: "Invalid Price", message: "Starting price must be at least 1,000 VND." });
      return;
    }

    const res = await getAllProductOfUserCollection(collectionId);
    if (res.status && Array.isArray(res.data)) {
      console.log(res.data);
      const productItem = res.data.find(item => item.productId === productId);
      const availableQuantity = productItem?.quantity || 0;
      if (quantity > availableQuantity) {
        setModal({
          open: true,
          type: "warning",
          title: "Invalid Quantity",
          message: `You only have ${availableQuantity} items.`,
        });
        return;
      }
    }
    try {
      setAssigning(true);
      const payload = {
        product_id: productId,
        auction_session_id: auctionIdToUse,
        quantity,
        starting_price: startingPrice,
      };
      const res = await productOfAuction(payload);

      if (res && (res.status === 200 || res.status === 201 || res.data)) {
        setModal({ open: true, type: "default", title: "Success", message: "Product assigned to auction successfully." });
        if (typeof onSuccess === "function") onSuccess(res);
        onClose();
      } else {
        setModal({ open: true, type: "error", title: "Assignment Error", message: "Assignment failed." });
      }
    } catch (err) {
      console.error("productOfAuction error:", err);
      setModal({ open: true, type: "error", title: "Assignment Error", message: "Failed to assign product to auction. Please try again." });
    } finally {
      setAssigning(false);
    }
  };
  const getMinDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // phút sang ms
    const localTime = new Date(now.getTime() - offset);
    return localTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };
  return (
    <Dialog
      open={open}
      // onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
        },
        "& .MuiDialog-paper": {
          background: "rgba(25, 25, 25, 0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--dark-1)",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
          padding: "1.5rem",
          color: "var(--light-4)",
          fontFamily: "Oxanium, sans-serif"
        },
      }}
    >
      {/* Close button */}
      <button className="sellModal-close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      {/* Header */}
      <div className="hostAuctionDialog-header">
        <div className="hostAuctionDialog-title oxanium-bold">Host product auction request form</div>
        {product?.name && (
          <div className="hostAuctionDialog-subtitle oleo-script-regular">
            {product.name}
          </div>
        )}
      </div>

      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel connector={<QontoConnector />}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={QontoStepIcon}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: index === activeStep ? '#784af4 !important' : 'var(--light-2)',
                    fontWeight: index === activeStep ? '600' : '400',
                    fontFamily: "Oxanium, sans-serif",
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={3}>
          {activeStep === 0 && (
            <>
              <div className="hostAuctionDialog-control">
                <label >Title: </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Auction Title"
                  className="hostAuctionDialog-input h-12 oxanium-regular w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="hostAuctionDialog-control">
                <label >Description: </label>
                <textarea
                  name="description"
                  type="text"
                  placeholder="Description"
                  className="hostAuctionDialog-input h-22 max-h-30 oxanium-regular w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="hostAuctionDialog-control">
                <label >Start time: </label>
                <input
                  name="startTime"
                  type="datetime-local"
                  placeholder="Start Time"
                  className="hostAuctionDialog-input h-12 oxanium-regular w-full"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={getMinDateTime()}
                />
              </div>
              {/* <p className="hostAuctionDialog-note oxanium-regular">Note: times are local; they'll be sent to the server in ISO format.</p> */}
            </>
          )}

          {activeStep === 1 && (
            <>
              <Box mb={2}>
                {fetchingLatest ? (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CircularProgress size={18} />
                    <p className="hostAuctionDialog-PrdAtt">Fetching latest auction...</p>
                  </Box>
                ) : createdAuctionObj ? (
                  <Box mt={1}>
                    <p className="hostAuctionDialog-PrdAtt"><strong>Title:</strong> {createdAuctionObj.title}</p>
                    <p className="hostAuctionDialog-PrdAtt"><strong>Start date:</strong> {displayTime(createdAuctionObj.start_time)}</p>
                  </Box>
                ) : (
                  <p className="hostAuctionDialog-note oxanium-regular">No auction found. You can go back and try again.</p>
                )}
              </Box>

              <Box display="flex" gap={2} mb={1}>
                <div className="hostAuctionDialog-control">
                  <label >Quantity: </label>
                  <input
                    name="quantity"
                    type="number"
                    placeholder="Quantity"
                    className="hostAuctionDialog-input h-12 oxanium-regular w-full"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="hostAuctionDialog-control">
                  <label >Starting Price: </label>
                  <input
                    name="startingPrice"
                    type="number"
                    placeholder="Starting price (VND)"
                    className="hostAuctionDialog-input h-12 oxanium-regular w-full"
                    min={1000}
                    step={100}
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                  />
                </div>
              </Box>

              {/* <p className="hostAuctionDialog-note oxanium-regular">The product will be assigned to the created auction with the specified quantity and starting price.</p> */}
            </>
          )}
        </Box>
      </DialogContent>

      <MessageModal
        open={modal.open}
        onClose={() => setModal((p) => ({ ...p, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message} />

      <DialogActions>
        <div className="hostAuctionDialog-Cancel-btn" onClick={closeModal}>Cancel</div>
        {activeStep > 0 && <div className="hostAuctionDialog-Back-btn" onClick={handleBack}>Back</div>}
        {activeStep === 0 ? (
          <div className="hostAuctionDialog-Submit-btn" onClick={handleNext}>
            {creating ? "Please wait..." : "Next"}
          </div>
        ) : (
          <div className="hostAuctionDialog-Submit-btn" onClick={handleSubmitAssignment}>
            {assigning ? "Please wait..." : "Submit"}
          </div>
        )}
      </DialogActions>

    </Dialog>
  );
}
