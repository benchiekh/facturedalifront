import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label } from "reactstrap";
import Switch from 'react-switch'; 
import axios from "axios";
import { toast } from 'react-toastify';

const AddTaxModal = ({ isOpen, toggle, refreshTaxes, userId }) => {
    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isDefault, setIsDefault] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/taxes");
            const existingTaxes = response.data;

            if (isDefault) {
                const currentDefaultTax = existingTaxes.find(tax => tax.isDefault);

                if (currentDefaultTax) {
                    await axios.put(`http://localhost:5000/api/taxes/${currentDefaultTax._id}`, {
                        ...currentDefaultTax,
                        isDefault: false
                    });
                }
            }

            await axios.post("http://localhost:5000/api/taxes", {
                name,
                value,
                isActive,
                isDefault,
                createdBy: userId,
            });

            toast.success('Tax added successfully', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            refreshTaxes();
            toggle();
        } catch (error) {
            console.error("Error adding tax:", error);
            toast.error('Error adding tax', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Add New Tax</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="name">Name</Label>
                    <Input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="value">Value (%)</Label>
                    <Input
                        type="number"
                        id="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="isActive">Active</Label>
                    <Switch
                        checked={isActive}
                        onChange={() => setIsActive(!isActive)}
                        onColor="#86d3ff"
                        offColor="#888"
                        onHandleColor="#002395"
                        offHandleColor="#d4d4d4"
                        handleDiameter={15}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={10}
                        width={30}
                        className="react-switch"
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="isDefault">Default</Label>
                    <Switch
                        checked={isDefault}
                        onChange={() => setIsDefault(!isDefault)}
                        onColor="#86d3ff"
                        offColor="#888"
                        onHandleColor="#002395"
                        offHandleColor="#d4d4d4"
                        handleDiameter={15}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={10}
                        width={30}
                        className="react-switch"
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit}>Add Tax</Button>
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default AddTaxModal;
