import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Radio, Select } from "antd";
import dayjs from "dayjs";
import { fetchMyAuctionList } from "../../../services/api.auction";

export default function HostAuctionModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
    form,
    setForm,
    mode,
    setMode
}) {
    const [antdForm] = Form.useForm();

    const [auctionOptions, setAuctionOptions] = useState([]);

    useEffect(() => {
        if (isOpen && mode === "addProduct") {
            fetchMyAuctionList()
                .then((res) => {


                    if (res?.data?.length) {
                        setAuctionOptions(
                            res.data.map((a) => ({
                                value: a._id,
                                label: `${a.title} — ${dayjs(a.start_time).format("YYYY-MM-DD HH:mm")}`
                            }))
                        );
                    } else {
                        console.warn("⚠️ No auction data found!");
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch auctions", err);
                });
        }
    }, [isOpen, mode]);

    const handleFinish = (values) => {
        let payload = {};

        if (mode === "newAuction") {
            payload = {
                title: values.title,
                description: values.description,
                start_time: values.start_time
                    ? values.start_time.toISOString()
                    : null
            };
        } else {
            payload = {
                auction_session_id: values.auction_session_id,
                quantity: values.quantity,
                starting_price: values.starting_price
            };
        }

        onSubmit(payload);
    };

    return (
        <Modal
            title="Host an Auction"
            open={isOpen}
            onCancel={onClose}
            onOk={() => antdForm.submit()}
            confirmLoading={loading}
            okText="Submit"
            cancelText="Cancel"
        >
            <Radio.Group
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={{ marginBottom: 16 }}
            >
                <Radio.Button value="newAuction">New Auction</Radio.Button>
                <Radio.Button value="addProduct">Add Product in Auction</Radio.Button>
            </Radio.Group>

            <Form
                form={antdForm}
                layout="vertical"
                initialValues={{
                    title: form.title,
                    description: form.description,
                    start_time: form.start_time ? dayjs(form.start_time) : null,
                    quantity: form.quantity,
                    starting_price: form.starting_price,
                    auction_session_id: form.auction_session_id
                }}
                onValuesChange={(changed, all) => setForm(all)}
                onFinish={handleFinish}
            >
                {mode === "newAuction" && (
                    <>
                        <Form.Item
                            label="Auction Title"
                            name="title"
                            rules={[{ required: true, message: "Please enter a title" }]}
                        >
                            <Input placeholder="Enter auction title" />
                        </Form.Item>

                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[{ required: true, message: "Please enter description" }]}
                        >
                            <Input.TextArea placeholder="Enter auction description" rows={3} />
                        </Form.Item>

                        <Form.Item
                            label="Start Time"
                            name="start_time"
                            rules={[{ required: true, message: "Please select start time" }]}
                        >
                            <DatePicker
                                showTime
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD HH:mm"
                            />
                        </Form.Item>
                    </>
                )}

                {mode === "addProduct" && (
                    <>

                        <Form.Item
                            label="Auction Name"
                            name="auction_session_id"
                            rules={[{ required: true, message: "Please select auction session" }]}
                        >
                            <Select
                                placeholder="Select auction session"
                                options={auctionOptions}
                                loading={!auctionOptions.length}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Quantity"
                            name="quantity"
                            rules={[{ required: true, message: "Please enter quantity" }]}
                        >
                            <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item
                            label="Starting Price"
                            name="starting_price"
                            rules={[{ required: true, message: "Please enter starting price" }]}
                        >
                            <InputNumber min={1000} step={100} style={{ width: "100%" }} />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
}
