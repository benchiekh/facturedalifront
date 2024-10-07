import React, { useState, useEffect } from "react";
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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupText
} from "reactstrap";
import Select from 'react-select';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCompanyModal from "../Companies/AddCompanyModal";
import countryList from 'react-select-country-list';
import { getCountryCallingCode, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import Flag from 'react-world-flags'; 

const AddPersonModal = ({ isOpen, toggle, refreshPeople, userId }) => {
  const [cin, setCin] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [company, setCompany] = useState("");
  const [pays, setPays] = useState(null);
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  const options = countryList().getData();

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/entreprise");
      const allCompanies = response.data;
      setCompanies(allCompanies);
      const userCompanies = allCompanies.filter(company => company.createdBy === userId);
      setFilteredCompanies(userCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleAddCompanyModal = () => setAddCompanyModalOpen(!addCompanyModalOpen);

  const handleCountryChange = (selectedOption) => {
    setPays(selectedOption);

    const countryCode = selectedOption?.value ? `+${getCountryCallingCode(selectedOption.value)}` : "";

    setTelephone((prev) => {
      const prevWithoutCode = prev.replace(/^\+\d+\s*/, '');
      return `${countryCode} ${prevWithoutCode}`;
    });
  };

  const validatePhoneNumber = (phoneNumber, countryCode) => {
    try {
      const phoneNumberObj = parsePhoneNumber(phoneNumber, countryCode);
      return phoneNumberObj.isValid();
    } catch (error) {
      return false;
    }
  };

  const checkUniqueness = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/people", {
        params: { createdBy: userId }
      });

      const userPersons = response.data.filter(person => person.createdBy === userId);;

      const isEmailUnique = !userPersons.some(person => person.email === email);

      if (!isEmailUnique) {
        toast.error('Email already exists among your contacts. Please use a different email.', {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return false;
      }

      const isPhoneUnique = !userPersons.some(person => person.telephone === telephone);

      if (!isPhoneUnique) {
        toast.error('Telephone number already exists among your contacts. Please use a different telephone number.', {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking uniqueness:", error);
      toast.error('Error checking uniqueness. Please try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pays) {
      const countryCode = pays.value;
      if (!validatePhoneNumber(telephone, countryCode)) {
        toast.error(`Invalid phone number for ${pays.label}. Please check the number format.`, {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
    }

    const isUnique = await checkUniqueness();
    if (!isUnique) return;

    const newPerson = {
      cin,
      prenom,
      nom,
      pays: pays?.label,
      telephone,
      email,
      createdBy: userId
    };

    if (company) {
      newPerson.entreprise = company;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/people", newPerson);
      refreshPeople();
      toggle(); 
      resetForm(); 
      toast.success('Person added successfully', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error creating new person:", error.response ? error.response.data : error.message);
      toast.error('Error creating person. Please try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const resetForm = () => {
    setCin("");
    setPrenom("");
    setNom("");
    setCompany("");
    setPays(null);
    setTelephone("");
    setEmail("");
  };

  const customSingleValue = ({ data }) => (
    <div className="custom-single-value">
      <Flag code={data.value} alt={data.label} style={{ width: 20, marginRight: 10 }} />
      {data.label}
    </div>
  );

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="custom-option">
        <Flag code={data.value} alt={data.label} style={{ width: 20, marginRight: 10 }} />
        {data.label}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
        <ModalHeader toggle={toggle}>Add New Person</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
          <FormGroup>
              <Label for="cin">Carte identite </Label>
              <InputGroup>
                <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                  <i className="ni ni-single-02"></i>
                </InputGroupText>
                <Input
                  type="number"
                  id="prenom"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  placeholder="Entrer votre identite ou Passport"
                  required
                  style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                  onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
              </InputGroup>
            </FormGroup>
            
            <FormGroup>
              <Label for="prenom">First Name</Label>
              <InputGroup>
                <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                  <i className="ni ni-single-02"></i>
                </InputGroupText>
                <Input
                  type="text"
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Entre first name"
                  required
                  style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                  onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="nom">Last Name</Label>
              <InputGroup>
                <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                  <i className="ni ni-hat-3"></i>
                </InputGroupText>
                <Input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Enter last name"
                  required
                  style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                  onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="company">Company</Label>
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret>
                  {company ? companies.find(comp => comp._id === company)?.nom : "Select company"}
                </DropdownToggle>
                <DropdownMenu>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(comp => (
                      <DropdownItem key={comp._id} onClick={() => setCompany(comp._id)}>
                        {comp.nom}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem disabled>No companies available</DropdownItem>
                  )}
                  <DropdownItem divider />
                  <DropdownItem onClick={toggleAddCompanyModal} className="d-flex align-items-center">
                    <span className="ni ni-fat-add text-blue mr-2" style={{ fontSize: '24px' }}></span>
                    Add New Company
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </FormGroup>
            <FormGroup>
              <Label for="pays">Country</Label>
              <Select
                options={options}
                value={pays}
                onChange={handleCountryChange}
                placeholder="Select country"
                isClearable
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
                components={{ SingleValue: customSingleValue, Option: customOption }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="telephone">Telephone</Label>
              <InputGroup>
                <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                  <i className="ni ni-mobile-button"></i>
                </InputGroupText>
                <Input
                  type="text"
                  id="telephone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Enter telephone number"
                  required
                  style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                  onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <InputGroup>
                <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                  <i className="ni ni-email-83"></i>
                </InputGroupText>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                  onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
              </InputGroup>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">Save</Button>{' '}
            <Button color="secondary" onClick={() => { toggle(); resetForm(); }}>Cancel</Button>
          </ModalFooter>
        </Form>
      </Modal>

      <AddCompanyModal
        isOpen={addCompanyModalOpen}
        toggle={toggleAddCompanyModal}
        refreshCompany={() => {
          fetchCompanies();
          toggleAddCompanyModal();
        }}
        userId={userId}
      />
    </>
  );
};

export default AddPersonModal;
