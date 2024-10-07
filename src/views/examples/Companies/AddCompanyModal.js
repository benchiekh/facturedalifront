import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import Flag from 'react-world-flags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faGlobe, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const validatePhoneNumber = (number, countryCode) => {
  if (!countryCode || !number) return false;

  const phoneNumber = parsePhoneNumberFromString(number, countryCode);
  return phoneNumber ? phoneNumber.isValid() : false;
};

const AddCompanyModal = ({ isOpen, toggle, refreshCompany, userId }) => {
 
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState(null);
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [rib, setRib] = useState("");
  const [matriculeFiscale, setmatriculeFiscale] = useState("");
  const [siteweb, setSiteweb] = useState("");
  const [mainContact, setMainContact] = useState(null);
  const [people, setPeople] = useState([]);

  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  const countryOptions = countryList().getData().map(country => ({
    value: country.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={country.value} style={{ width: 20, marginRight: 10 }} />
        {country.label}
      </div>
    )
  }));

  useEffect(() => {
    if (isOpen) {
      fetchPeople();
    }
  }, [isOpen]);

  const fetchPeople = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/people");
      setPeople(response.data.filter(person => person.createdBy === currentUserId));
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };

  const handleCountryChange = (selectedOption) => {
    setPays(selectedOption);

    const countryCode = selectedOption?.value ? `+${getCountryCallingCode(selectedOption.value)}` : "";

    setTelephone((prev) => {
      const numberWithoutCode = prev.replace(/^\+\d+\s*/, '');
      return `${countryCode} ${numberWithoutCode}`;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(telephone, pays?.value)) {
      toast.error('Invalid phone number for the selected country. Please check the number and try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const newCompany = {
      nom,
      pays: pays ? pays.value : "",
      telephone,
      email,
      rib,
      matriculeFiscale,
      siteweb,
      createdBy: userId,
      mainContact
    };

    try {
      const response = await axios.post("http://localhost:5000/api/entreprise", newCompany);
      refreshCompany();
      toggle();
      toast.success('Company added successfully', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setNom("");
      setPays(null);
      setTelephone("");
      setEmail("");
      setRib("");
      setmatriculeFiscale("");
      setSiteweb("");
      setMainContact(null);
    } catch (error) {
      console.error("Error creating new company:", error.response || error.message);
      toast.error('Error creating company. Please try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const filterOption = (option, inputValue) => {
    return option.label.props.children[1].toLowerCase().includes(inputValue.toLowerCase());
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
      <ModalHeader toggle={toggle}>Add New Company</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="nom">Company Name</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faBuilding} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="pays">Country</Label>
            <Select
              options={countryOptions}
              value={pays}
              onChange={handleCountryChange}
              placeholder="Select country"
              isClearable
              isSearchable
              filterOption={filterOption} 
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: '1px solid #ced4da',
                  borderRadius: '0.25rem',
                  transition: 'border-color 0.2s'
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999
                })
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label for="telephone">Telephone</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faPhone} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faEnvelope} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="rib">RIB</Label>
            <InputGroup>
              
              <Input
                type="text"
                id="rib"
                value={rib}
                onChange={(e) => setRib(e.target.value)}
                placeholder="Enter your RIB "
                required
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="matricule">Matricule Fiscale</Label>
            <InputGroup>
            
              <Input
                type="text"
                id="matriculeFiscale"
                value={matriculeFiscale}
                onChange={(e) => setmatriculeFiscale(e.target.value)}
                placeholder="Enter your matricule Fiscale"
                required
              />
            </InputGroup>
          </FormGroup>


          <FormGroup>
            <Label for="siteweb">Website</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faGlobe} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="siteweb"
                value={siteweb}
                onChange={(e) => setSiteweb(e.target.value)}
                placeholder="Enter website URL"
                required
              />
            </InputGroup>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">Save</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddCompanyModal;
