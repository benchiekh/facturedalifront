import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faTag, faFont, faExchangeAlt, faHashtag } from '@fortawesome/free-solid-svg-icons';
import currencies from './Currencies'; // Import the currencies
import Switch from 'react-switch'

const AddCurrency = ({ isOpen, toggle, refreshCurrencies, userId }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [symbol, setSymbol] = useState('');
  const [symbolPosition, setSymbolPosition] = useState('before');
  const [decimalSeparator, setDecimalSeparator] = useState('.');
  const [thousandSeparator, setThousandSeparator] = useState(',');
  const [precision, setPrecision] = useState(2);
  const [zeroFormat, setZeroFormat] = useState('show');
  const [active, setActive] = useState(true);
  const [userCurrencies, setUserCurrencies] = useState([]); // Store the existing currencies for the user

  useEffect(() => {
    // Fetch existing currencies for the current user when component mounts
    const fetchUserCurrencies = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/currency`, { params: { createdBy: userId } });
        setUserCurrencies(response.data);
      } catch (error) {
        console.error("Error fetching user currencies:", error);
        toast.error('Error fetching existing currencies.');
      }
    };

    if (userId) {
      fetchUserCurrencies();
    }
  }, [userId]);

  const handleCurrencyChange = (e) => {
    const selectedCode = e.target.value;
    setCode(selectedCode);
  
    const selectedCurrency = currencies.find(currency => currency.code === selectedCode);
    if (selectedCurrency) {
      setSymbol(selectedCurrency.symbol);
      setName(selectedCurrency.name); 
    } else {
      setSymbol(''); 
      setName(''); 
    }
  };
  

  const handleAddCurrency = async () => {
    if (userCurrencies.some(currency => currency.code === code)) {
      toast.error('Currency already exists .');
      return;
    }

    try {
      const newCurrency = {
        name,
        code,
        symbol,
        symbolPosition,
        decimalSeparator,
        thousandSeparator,
        precision,
        zeroFormat,
        active,
        createdBy: userId,
      };

      const response = await axios.post('http://localhost:5000/api/currency', newCurrency, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Refresh the currency list and close the modal
      refreshCurrencies();
      toggle();
      toast.success('Currency added successfully');

      // Reset the form fields to their initial state
      setName('');
      setCode('');
      setSymbol('');
      setSymbolPosition('before');
      setDecimalSeparator('.');
      setThousandSeparator(',');
      setPrecision(2);
      setZeroFormat('show');
      setActive(true);
      setUserCurrencies([...userCurrencies, newCurrency]); // Update local state
    } catch (error) {
      console.error("Error adding currency:", error);

      if (error.response) {
        toast.error(`Error: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        toast.error('No response received from the server.');
      } else {
        toast.error('An error occurred while adding the currency.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-right">
      <ModalHeader toggle={toggle}>Add New Currency</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="currencyCode">Code</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faFont} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                id="currencyCode"
                value={code}
                onChange={handleCurrencyChange}
              >
                <option value="">Select currency code</option>
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="currencyName">Name</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faTag} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencyName"
                value={name}
                placeholder="Enter currency name"
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label for="currencySymbol">Symbol</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faDollarSign} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencySymbol"
                value={symbol}
                placeholder="Enter currency symbol"
                onChange={(e) => setSymbol(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="symbolPosition">Symbol Position</Label>
            <Input
              type="select"
              id="symbolPosition"
              value={symbolPosition}
              onChange={(e) => setSymbolPosition(e.target.value)}
            >
              <option value="before">Before</option>
              <option value="after">After</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="decimalSeparator">Decimal Separator</Label>
            <Input
              type="text"
              id="decimalSeparator"
              value={decimalSeparator}
              placeholder="Enter decimal separator"
              onChange={(e) => setDecimalSeparator(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="thousandSeparator">Thousand Separator</Label>
            <Input
              type="text"
              id="thousandSeparator"
              value={thousandSeparator}
              placeholder="Enter thousand separator"
              onChange={(e) => setThousandSeparator(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="precision">Precision</Label>
            <Input
              type="number"
              id="precision"
              value={precision}
              min="0"
              onChange={(e) => setPrecision(parseInt(e.target.value, 10))}
            />
          </FormGroup>
          <FormGroup>
            <Label for="zeroFormat">Zero Format</Label>
            <Input
              type="select"
              id="zeroFormat"
              value={zeroFormat}
              onChange={(e) => setZeroFormat(e.target.value)}
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="active">Active</Label>
            <Switch
              checked={active}
              onChange={() => setActive(!active)}
              offColor="#888"
              onColor="#0d6efd"
              handleDiameter={20}
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={48}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleAddCurrency}>Add Currency</Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddCurrency;
