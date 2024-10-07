import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Row,
    Col,
    FormGroup,
    Label
} from 'reactstrap';
import { toast } from 'react-toastify';

const EditInvoiceModal = ({ isOpen, toggle, invoiceData, refreshInvoices, userId }) => {
    const [invoice, setInvoice] = useState({
        client: '',
        number: 1,
        year: new Date().getFullYear(),
        currency: '',
        status: 'Brouillon',
        date: new Date().toISOString().substring(0, 10),
        expirationDate: '',
        note: '',
        items: [{ article: '', description: '', quantity: 1, price: 0, total: 0 }],
        paidAmount: 0, 
    });
    

    const [taxOptions, setTaxOptions] = useState([]);
    const [selectedTax, setSelectedTax] = useState('');
    const [taxAmount, setTaxAmount] = useState(0);
    const [invoiceTotal, setInvoiceTotal] = useState(0);
    const [clientOptions, setClientOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [statusOptions] = useState(['Brouillon', 'Envoyé', 'Annulé']); 

    useEffect(() => {
        const fetchTaxes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/taxes', {
                    params: { createdBy: userId, isActive: true }
                });
                setTaxOptions(response.data.map(tax => ({
                    value: tax._id,
                    label: `${tax.name} - ${tax.value}%`
                })));
            } catch (error) {
                console.error("Error fetching taxes:", error);
            }
        };

        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/client', {
                    params: { createdBy: userId }
                });
                setClientOptions(response.data.map(client => {
                    if (client.type === 'Person' && client.person) {
                        return {
                            value: client._id,
                            label: `${client.person.nom} ${client.person.prenom}`
                        };
                    } else if (client.type === 'Company' && client.entreprise) {
                        return {
                            value: client._id,
                            label: client.entreprise.nom
                        };
                    } else {
                        return {
                            value: client._id,
                            label: `Unknown Client`
                        };
                    }
                }));
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/currency', {
                    params: { createdBy: userId, active: true }
                });
                setCurrencyOptions(response.data.map(currency => ({
                    value: currency._id,
                    label: `${currency.code} - ${currency.name}`
                })));
            } catch (error) {
                console.error("Error fetching currencies:", error);
            }
        };

        fetchTaxes();
        fetchClients();
        fetchCurrencies();
    }, [userId]);

    useEffect(() => {
        if (invoiceData) {
            setInvoice(invoiceData);
            setSelectedTax(invoiceData.tax);
        }
    }, [invoiceData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoice({ ...invoice, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...invoice.items];
        newItems[index] = { ...newItems[index], [name]: value };
        newItems[index].total = newItems[index].quantity * newItems[index].price;
        setInvoice({ ...invoice, items: newItems });
    };

    const addItem = () => {
        setInvoice({ ...invoice, items: [...invoice.items, { article: '', description: '', quantity: 1, price: 0, total: 0 }] });
    };

    const removeItem = (index) => {
        const newItems = invoice.items.filter((_, i) => i !== index);
        setInvoice({ ...invoice, items: newItems });
    };

    const calculateSubtotal = () => {
        return invoice.items.reduce((acc, item) => acc + item.total, 0);
    };

    const handleTaxChange = (e) => {
        setSelectedTax(e.target.value);
    };

    useEffect(() => {
        console.log(invoice.paidAmount)
        const subtotal = calculateSubtotal();
        const selectedTaxOption = taxOptions.find(tax => tax.value === selectedTax);
        const calculatedTax = selectedTaxOption ? (subtotal * parseFloat(selectedTaxOption.label.split(' - ')[1])) / 100 : 0;
        setTaxAmount(calculatedTax);
        setInvoiceTotal(subtotal + calculatedTax);
    }, [invoice.items, selectedTax, taxOptions]);

    const handleSave = async () => {
        try {
            const payload = {
                ...invoice,
                subtotal: calculateSubtotal(),
                tax: selectedTax,
                taxAmount: taxAmount,
                total: invoiceTotal,
                createdBy: userId
            };
    
            let paymentStatus = invoice.paidAmount >= payload.total ? 'Paid' : 'Unpaid';
    
            await axios.put(`http://localhost:5000/api/invoices/${invoice._id}`, payload);
    
            if (paymentStatus === 'Unpaid') {
                await axios.put(`http://localhost:5000/api/invoices/${invoice._id}`, {
                    paymentStatus: paymentStatus
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }
    
            toast.success('Invoice updated successfully', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            refreshInvoices();
            toggle();
        } catch (error) {
            console.error("Error updating invoice:", error);
        }
    };
    

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Edit Invoice</ModalHeader>
            <ModalBody>
                <Row form>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="client">Client</Label>
                            <Input
                                type="select"
                                name="client"
                                id="client"
                                value={invoice.client}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Client</option>
                                {clientOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="number">Number</Label>
                            <Input
                                type="number"
                                name="number"
                                id="number"
                                value={invoice.number}
                                onChange={handleInputChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="year">Year</Label>
                            <Input
                                type="number"
                                name="year"
                                id="year"
                                value={invoice.year}
                                onChange={handleInputChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row form>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="date">Date</Label>
                            <Input
                                type="date"
                                name="date"
                                id="date"
                                value={invoice.date}
                                onChange={handleInputChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="expirationDate">Expiration Date</Label>
                            <Input
                                type="date"
                                name="expirationDate"
                                id="expirationDate"
                                value={invoice.expirationDate}
                                onChange={handleInputChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row form>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="currency">Currency</Label>
                            <Input
                                type="select"
                                name="currency"
                                id="currency"
                                value={invoice.currency}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Currency</option>
                                {currencyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="status">Status</Label>
                            <Input
                                type="select"
                                name="status"
                                id="status"
                                value={invoice.status}
                                onChange={handleInputChange}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>
                <FormGroup>
                    <Label for="note">Note</Label>
                    <Input
                        type="textarea"
                        name="note"
                        id="note"
                        value={invoice.note}
                        onChange={handleInputChange}
                    />
                </FormGroup>
                <h5>Items</h5>
                {invoice.items.map((item, index) => (
                    <Row form key={index} className="align-items-center items-row">
                        <Col md={3}>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="article"
                                    placeholder="Item Name"
                                    value={item.article}
                                    onChange={(e) => handleItemChange(index, e)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="description"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, e)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={2}>
                            <FormGroup>
                                <Input
                                    type="number"
                                    name="quantity"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, e)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={2}>
                            <FormGroup>
                                <Input
                                    type="number"
                                    name="price"
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, e)}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={1} className="text-center">
                            <Button close onClick={() => removeItem(index)} />
                        </Col>
                    </Row>
                ))}
                <Button color="primary" onClick={addItem}>Add Item</Button>
                <Row form className="mt-3">
                    <Col md={6}>
                        <FormGroup>
                            <Label for="tax">Tax</Label>
                            <Input
                                type="select"
                                name="tax"
                                id="tax"
                                value={selectedTax}
                                onChange={handleTaxChange}
                            >
                               
                                {taxOptions.map((tax) => (
                                    <option key={tax.value} value={tax.value}>
                                        {tax.label}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <div>Subtotal: ${calculateSubtotal().toFixed(2)}</div>
                        <div>Tax: ${taxAmount.toFixed(2)}</div>
                        <div>Total: ${invoiceTotal.toFixed(2)}</div>
                    </Col>
                </Row>
                
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancel</Button>
                <Button color="primary" onClick={handleSave}>Save</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditInvoiceModal;
