import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table
} from 'reactstrap';
import countryList from 'react-select-country-list'; 

const DisplayCompanyModal = ({ isOpen, toggle, company, people }) => {

  const countryOptions = countryList().getData();
  const countryMap = countryOptions.reduce((acc, country) => {
    acc[country.value] = country.label;
    return acc;
  }, {});

  const getMainContactNameById = (id) => {
    const maincontact = people.find(person => person.entreprise === id);
    return maincontact ? maincontact.prenom + " " + maincontact.nom : 'Main contact not found';
  };

  const thStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    color: '#770737',
    backgroundColor: '#FFB6C1',
    textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff',
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Company Details</ModalHeader>
      <ModalBody>
        <Table responsive>
          <tbody>
            <tr>
              <th><span style={thStyle}>Name</span></th>
              <td>{company.nom}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Main Contact</span></th>
              <td>{getMainContactNameById(company._id)}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Country</span></th>
              <td>{countryMap[company.pays] || company.pays}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Telephone</span></th>
              <td>{company.telephone}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Email</span></th>
              <td>{company.email}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>RIB</span></th>
              <td>{company.rib}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Matricule Fiscale </span></th>
              <td>{company.matriculeFiscale}</td>
            </tr>
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DisplayCompanyModal;
