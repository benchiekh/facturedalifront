import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table
} from 'reactstrap';

const DisplayCurrencyModal = ({ isOpen, toggle, currency }) => {

  const thStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    color: '#770737',
    backgroundColor: '#FFB6C1',
    textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff',
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
    >
      <ModalHeader toggle={toggle}>Currency Details</ModalHeader>
      <ModalBody>
        <Table responsive>
          <tbody>
            <tr>
              <th><span style={thStyle}>Name</span></th>
              <td>{currency.name}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Code</span></th>
              <td>{currency.code}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Symbol</span></th>
              <td>{currency.symbol}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Symbol Position</span></th>
              <td>{currency.symbolPosition}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Decimal Separator</span></th>
              <td>{currency.decimalSeparator}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Thousand Separator</span></th>
              <td>{currency.thousandSeparator}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Precision</span></th>
              <td>{currency.precision}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Zero Format</span></th>
              <td>{currency.zeroFormat}</td>
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

export default DisplayCurrencyModal;
