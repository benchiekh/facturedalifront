import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table
} from 'reactstrap';

const DisplayProductModal = ({ isOpen, toggle, product, categories,currencies }) => {

  const getCategoryNameById = (id) => {
    const category = categories.find(category => category._id === id);
    return category ? category.name : 'Category Not Found';
  };

  const getCurrencyCodeById = (id) => {
    const currency = currencies.find(currency => currency._id === id);
    return currency ? currency.code : 'Currency Not Found';
};

  const thStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    color: '#770737',
    backgroundColor: '#FFB6C1	',
    textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff',

  };
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
    >


      <ModalHeader toggle={toggle}>Product Details</ModalHeader>
      <ModalBody>
        <Table responsive>
          <tbody>
            <tr>
              <th><span style={thStyle}>Name</span></th>
              <td>{product.name}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Category</span></th>
              <td>{getCategoryNameById(product.productCategory._id)}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Currency</span></th>
              <td>{getCurrencyCodeById(product.currency)}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Price</span></th>
              <td>{product.price}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Description</span></th>
              <td>{product.description}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Reference</span></th>
              <td>{product.reference}</td>
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

export default DisplayProductModal;
