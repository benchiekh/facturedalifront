import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faList, faDollarSign, faMoneyBill, faFileAlt, faBarcode } from '@fortawesome/free-solid-svg-icons';

const AddProduct = ({ isOpen, toggle, refreshProducts, userId }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/category", { params: { createdBy: userId } });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/currency", { params: { createdBy: userId } });
      setCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCurrencies();
  }, [userId]);

  const handleAddProduct = async () => {
    try {
      const newProduct = {
        name,
        productCategory: category,
        currency,
        price,
        description,
        reference,
        createdBy: userId
      };

      await axios.post('http://localhost:5000/api/product', newProduct);
      refreshProducts();
      toggle();
      toast.success('Product added successfully');
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error('Error adding product. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-right">
      <ModalHeader toggle={toggle}>Add New Product</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="productName">Name</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faTag} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="productName"
                value={name}
                placeholder="Enter product name"
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="productCategory">Category</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faList} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                id="productCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Select a category</option>
                {categories
                  .filter((category) => category.enabled)
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="productCurrency">Currency</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faDollarSign} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                id="productCurrency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="" disabled>Select a currency</option>
                {currencies
                  .filter((currency) => currency.active) // Ensure only active currencies are displayed
                  .map((currency) => (
                    <option key={currency._id} value={currency._id}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="productPrice">Price</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faMoneyBill} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="number"
                id="productPrice"
                value={price}
                placeholder="Enter price"
                onChange={(e) => setPrice(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="productDescription">Description</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faFileAlt} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="textarea"
                id="productDescription"
                value={description}
                placeholder="Enter product description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="productReference">Reference</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faBarcode} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="productReference"
                value={reference}
                placeholder="Enter product reference"
                onChange={(e) => setReference(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleAddProduct}>Add Product</Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddProduct;
