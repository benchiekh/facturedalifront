import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Button, FormGroup, Label, Input, Col, Row
} from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const SavePaymentModal = ({ isOpen, toggle, invoice, refreshInvoices, userId }) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentMethod, setPaymentMethod] = useState('');

    const remainingAmount = invoice.total - invoice.paidAmount;

    useEffect(() => {
        if (invoice) {
            setAmount('');
            setPaymentDate(new Date().toISOString().split("T")[0]);
            setPaymentMethod('');
        }
    }, [invoice, isOpen]);

    const handleSave = async () => {
        const amountValue = parseFloat(amount);

        if (isNaN(amountValue) || amountValue <= 0) {
            toast.error('Please enter a valid payment amount.');
            return;
        }

        if (amountValue > remainingAmount) {
            toast.error('Payment amount exceeds the remaining amount to be paid.');
            return;
        }

        if (invoice.paymentStatus === 'Paid') {
            toast.warning('This invoice has already been paid.');
            return;
        }

        // Check if payment is made after the expiration date
        const expirationDate = new Date(invoice.expirationDate);
        const selectedPaymentDate = new Date(paymentDate);

        

        // Save the payment
        try {
            await axios.post(`http://localhost:5000/api/payments/invoice/${invoice._id}`, {
                amountPaid: amountValue,
                paymentDate,
                paymentMethod,
                createdBy: userId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success('Payment recorded successfully');
            refreshInvoices();
            toggle();
        } catch (error) {
            console.error("Error saving payment:", error.response?.data || error.message);
            toast.error('Failed to save payment');
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Record Payment for Invoice # {invoice.number}
                <span className={`badge badge-${invoice.paymentStatus === 'Paid' ? 'success' : invoice.paymentStatus === 'Partially Paid' ? 'info' : 'danger'} ml-2`}>
                    {invoice.paymentStatus}
                </span>
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="amount">Amount</Label>
                            <Input
                                type="number"
                                name="amount"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="paymentDate">Payment Date</Label>
                            <Input
                                type="date"
                                name="paymentDate"
                                id="paymentDate"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="paymentMethod">Payment Method</Label>
                            <Input
                                type="select"
                                name="paymentMethod"
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required
                            >
                                <option value="">Select Method</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <div className="client-details">
                            <h6>Client: {invoice.client.name}</h6>
                            <p>Email: {invoice.client.email}</p>
                            <p>Phone: {invoice.client.phone}</p>
                            <p>Payment Status: <span className={`badge badge-${invoice.paymentStatus === 'Paid' ? 'success' : invoice.paymentStatus === 'Partially Paid' ? 'info' : 'danger'}`}>{invoice.paymentStatus}</span></p>
                            <hr />
                            <p>Subtotal: {invoice.subtotal} $</p>
                            <p>Total: {invoice.total} $</p>
                            <p>Paid: {invoice.paidAmount} $</p>
                            <p>Remaining Amount: {remainingAmount} $</p>
                        </div>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>Save Payment</Button>
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default SavePaymentModal;
