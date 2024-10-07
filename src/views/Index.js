import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardBody, Col, Container, Row, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, CardTitle, Spinner, Button, Badge, CardHeader, Progress, Table } from "reactstrap";

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const Index = () => {
  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalProforma, setTotalProforma] = useState(0);
  const [loadingPaid, setLoadingPaid] = useState(false);
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);
  const [loadingProforma, setLoadingProforma] = useState(false);
  const [payments, setPayments] = useState(false);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);


  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/client', {
        params: { createdBy: currentUserId }
      });
      setClients(response.data);
      console.log(response.data);
    } catch (err) {
      toast.error('Failed to fetch clients');
    }
  };
  const fetchCurrencies = async () => {
    try {
      const currencyResponse = await axios.get("http://localhost:5000/api/currency", {
        params: { createdBy: currentUserId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrencies(currencyResponse.data.filter(currency => currency.active));

      

    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoices/${currentUserId}`, {
        params: {
          type: selectedType || undefined,
          status: selectedStatus || undefined,
        }
      });

      const invoicesData = response.data;
      setInvoices(invoicesData);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const totalUnpaidAmount = invoicesData
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date);
          return (
            invoice?.type === 'Standard' &&
            invoice?.paymentStatus === "Unpaid" &&
            invoice?.currency?._id === selectedCurrency?._id &&
            invoiceDate.getMonth() + 1 === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          );
        })
        .reduce((total, invoice) => total + invoice.total, 0);

      setTotalUnpaid(totalUnpaidAmount);

      const totalProformaAmount = invoicesData
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date);
          return (
            invoice?.type === 'Proforma' &&
            invoice?.currency?._id === selectedCurrency?._id &&
            invoiceDate.getMonth() + 1 === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          );
        })
        .reduce((total, invoice) => total + invoice.total, 0);

      setTotalProforma(totalProformaAmount);

    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };



  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (invoice?.type === 'Standard' || invoice?.isConverted === true) && invoice?.paymentStatus === "Paid"
    );
  });




  //console.log("all",invoices)
  //console.log("filtred",filteredInvoices)

  const getCurrencyByInvoiceId = (id) => {
    const invoice = filteredInvoices.find(invoice => invoice._id === id);
    if (!invoice || !invoice.currency) {
      return null;
    }
    console.log(invoice.currency);
    return invoice.currency._id;
  };



  const filteredStandardInvoices = invoices.filter((invoice) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const invoiceDate = new Date(invoice.date);
    return (

      invoice?.type === 'Standard' && invoice?.currency?._id === selectedCurrency?._id
      && invoiceDate.getMonth() + 1 === currentMonth &&
      invoiceDate.getFullYear() === currentYear


    );
  });

  const filteredProformaInvoices = invoices.filter((invoice) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const invoiceDate = new Date(invoice.date);
    return (

      invoice?.type === 'Proforma' && invoice?.currency?._id === selectedCurrency?._id &&
      invoiceDate.getMonth() + 1 === currentMonth &&
      invoiceDate.getFullYear() === currentYear

    );
  });
  const filteredInvoicesByStatus = (status) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice?.type === 'Standard' &&
        invoice?.status === status &&
        invoiceDate.getMonth() + 1 === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice?.currency?._id === selectedCurrency?._id
      );
    });
  };
  const filteredProformaInvoicesByStatus = (status) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice?.type === 'Proforma' &&
        invoice?.status === status &&
        invoiceDate.getMonth() + 1 === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice?.currency?._id === selectedCurrency?._id
      );
    });
  };
  const filteredInvoicesByPaymentStatus = (status) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice?.type === 'Standard' &&
        invoice?.paymentStatus === status &&
        invoiceDate.getMonth() + 1 === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice?.currency?._id === selectedCurrency?._id
      );
    });
  };
  const Proformastatuspercentage = (status) => {
    if (!selectedCurrency || filteredProformaInvoices.length === 0) {
      return 0;
    }

    const filteredInvoices = filteredProformaInvoicesByStatus(status);

    const percentage = (filteredInvoices.length / filteredProformaInvoices.length) * 100;

    return Math.round(percentage);
  };
  const Paymentstatuspercentage = (status) => {
    if (!selectedCurrency || filteredStandardInvoices.length === 0) {
      return 0;
    }

    const filteredInvoices = filteredInvoicesByPaymentStatus(status);

    const percentage = (filteredInvoices.length / filteredStandardInvoices.length) * 100;

    return Math.round(percentage);
  };


  const Draftstatuspercentage = (status) => {
    if (!selectedCurrency || filteredStandardInvoices.length === 0) {
      return 0;
    }

    const filteredInvoices = filteredInvoicesByStatus(status);

    const percentage = (filteredInvoices.length / filteredStandardInvoices.length) * 100;

    return Math.round(percentage);
  };


  const fetchPayment = async () => {
    try {
      const paymentResponse = await axios.get(`http://localhost:5000/api/payments/createdBy/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const paymentsThisMonth = paymentResponse.data.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return (
          paymentDate.getMonth() + 1 === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      });
      const paymentsByCurrency = paymentsThisMonth.reduce((acc, payment) => {
        const currencyId = getCurrencyByInvoiceId(payment.invoice);
        const x = Draftstatuspercentage();
        console.log(x)
        if (!currencyId) {
          return acc;
        }

        const paymentAmount = payment.amountPaid;
        if (!acc[currencyId]) {
          acc[currencyId] = 0;
        }
        acc[currencyId] += paymentAmount;

        return acc;
      }, {});

      console.log('Payments by Currency:', paymentsByCurrency);
      setPayments(paymentsByCurrency);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const getClientNameById = (clientId) => {
    const client = clients.find(client => client._id === clientId);
    if (!client) return 'Client not found';

    if (client.type === 'Person' && client.person) {
      return (
        <>
          {client.person.prenom} <br /> {client.person.nom}
        </>
      );
    } else if (client.type === 'Company' && client.entreprise) {
      return client.entreprise.nom;
    } else {
      return 'Client type not recognized';
    }
  };


  const getStatusStyle = (status) => {
    switch (status) {
      case 'Envoyé':
        return 'success';
      case 'Annulé':
        return 'danger';
      case 'Brouillon':
        return 'light';

      case 'Cancelled':
        return 'danger';
      default:
        return 'light';
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Unpaid':
        return 'danger';
      case 'Partially Paid':
        return 'info';
      case 'Retard':
        return 'warning';
      default:
        return 'light';
    }
  };


  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
  };

  const getCurrencySymbolById = (id, price) => {
    const numericPrice = Number(price);

    if (isNaN(numericPrice)) {
      return 'Invalid amount';
    }

    const currency = currencies.find(c => c._id === id);
    if (!currency) return numericPrice.toFixed(2);

    return `${currency.symbol} ${numericPrice.toFixed(2)}`;
  };

  const toggleCurrencyDropdown = () => setCurrencyDropdownOpen(!currencyDropdownOpen);

  useEffect(() => {
    fetchInvoices();
    fetchCurrencies();
    fetchClients();
    fetchPayment();
  }, [selectedCurrency]);




  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <Row className="mb-4">
            <Col lg="12" className="mb-4 d-flex justify-content-end">
              <Dropdown
                isOpen={currencyDropdownOpen}
                toggle={toggleCurrencyDropdown}
              >
                <DropdownToggle caret>
                  {selectedCurrency ? selectedCurrency.name : "Select Currency"}
                </DropdownToggle>
                <DropdownMenu>
                  {currencies.map(currency => (
                    <DropdownItem key={currency._id} onClick={() => handleCurrencySelect(currency)}>
                      {currency.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>
          <div className="header-body">
            <Row>
              {/* Paid Invoices Card */}
              <Col lg="6" xl="4">

                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Paid Invoices
                        </CardTitle>
                        <Badge color="success" style={{ fontSize: "20px" }}>
                          {selectedCurrency && payments[selectedCurrency._id] !== undefined
                            ? getCurrencySymbolById(selectedCurrency._id, payments[selectedCurrency._id])
                            : "0.00"}
                        </Badge>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                          <i className="fas fa-check-circle" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              {/* Unpaid Invoices Card */}
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Unpaid Invoices
                        </CardTitle>
                        <Badge color="danger" style={{ fontSize: "20px" }}>
                          {selectedCurrency ? getCurrencySymbolById(selectedCurrency._id, totalUnpaid) : "0.00"}
                        </Badge>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-times-circle" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              {/* Proforma Invoices Card */}
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Sent Invoices
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {loadingProforma ? (
                            <Spinner size="sm" color="primary" />
                          ) : (
                            getCurrencySymbolById(selectedCurrency?._id, totalProforma)
                          )}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-file-invoice" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>

      </div>
      <Container className="mt--7" fluid>
        {/* Second Row */}
        <Row className="mt-4">
          <Col lg="8">
            <Row>
              <Col lg="6">
                <Card className="shadow">
                  <CardHeader>
                    <h6> Received Invoices</h6>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Brouillon</div>
                        <div className="text-dark font-weight-bold">{Draftstatuspercentage('Brouillon')}%</div>
                      </div>
                      <Progress color="dark" value={Draftstatuspercentage('Brouillon')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Envoyé</div>
                        <div className="text-dark font-weight-bold">{Draftstatuspercentage('Envoyé')}%</div>
                      </div>
                      <Progress color="info" value={Draftstatuspercentage('Envoyé')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Impayé</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Unpaid')}%</div>
                      </div>
                      <Progress color="warning" value={Paymentstatuspercentage('Unpaid')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>En Retard</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Retard')}%</div>
                      </div>
                      <Progress color="danger" value={Paymentstatuspercentage('Retard')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Partiellement</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Partially Paid')}%</div>
                      </div>
                      <Progress color="info" value={Paymentstatuspercentage('Partially Paid')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Payé</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Paid')}%</div>
                      </div>
                      <Progress color="success" value={Paymentstatuspercentage('Paid')} />
                    </div>
                  </CardHeader>
                </Card>
              </Col>

              <Col lg="6">
                <Card className="shadow">
                  <CardHeader>
                    <h6> Sent Invoices</h6>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Brouillon</div>
                        <div className="text-dark font-weight-bold">{Proformastatuspercentage("Brouillon")}%</div>
                      </div>
                      <Progress color="dark" value={Proformastatuspercentage("Brouillon")} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>En Attente</div>
                        <div className="text-dark font-weight-bold">{Proformastatuspercentage("En Attente")}%</div>
                      </div>
                      <Progress color="secondary" value={Proformastatuspercentage("En Attente")} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Envoyé</div>
                        <div className="text-dark font-weight-bold">{Proformastatuspercentage("Envoyé")}%</div>
                      </div>
                      <Progress color="info" value={Proformastatuspercentage("Envoyé")} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Refusé</div>
                        <div className="text-dark font-weight-bold">{Proformastatuspercentage("Refusé")}%</div>
                      </div>
                      <Progress color="danger" value={Proformastatuspercentage("Refusé")} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Accepté</div>
                        <div className="text-dark font-weight-bold">{Proformastatuspercentage("Accepté")} %</div>
                      </div>
                      <Progress color="success" value={Proformastatuspercentage("Accepté")} className="mb-3" />

                    </div>
                  </CardHeader>
                </Card>
              </Col>


            </Row>
          </Col>

          <Col lg="4">
            <Card className="shadow">
              <CardHeader>
                <h6>Clients</h6>
                <div className="text-center">
                  <div className="display-3">0%</div>
                  <p>Nouveau client ce mois-ci</p>
                  <div style={{ color: "#40c57d" }}>
                    <i className="ni ni-bold-up"></i> 100.00%
                  </div>
                  <p>Client actif</p>
                </div>
              </CardHeader>
            </Card>
          </Col>
        </Row>


        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="6">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Recent Received invoices</h3>
                  </div>
                  <div className="col text-right">
                    <Link to="/admin/invoices">
                      <Button color="primary" size="sm">
                        See all
                      </Button>
                    </Link>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Number</th>
                    <th scope="col">Client</th>
                    <th scope="col">Total </th>
                    <th scope="col">Status</th>
                    <th scope="col"></th>

                  </tr>
                </thead>
                <tbody>
                  {filteredStandardInvoices.length > 0 ? (
                    filteredStandardInvoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td>{invoice.number}</td>
                        <td>{getClientNameById(invoice.client._id)}</td>

                        <td>
                          {invoice.currency ? getCurrencySymbolById(invoice.currency._id, invoice.total) : 'Currency Not Available'}
                        </td>



                        <td>
                          <Badge color={getStatusStyle(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>


                        {/* <td>
                                                        <Dropdown isOpen={dropdownOpen === invoice._id} toggle={() => toggleDropdown(invoice._id)} >
                                                            <DropdownToggle tag="span" data-toggle="dropdown" style={{ cursor: 'pointer' }}>
                                                                <FontAwesomeIcon icon={faEllipsisH} style={{ fontSize: '1rem' }} />
                                                            </DropdownToggle>
                                                            <DropdownMenu right style={{ marginTop: "-25px" }}>
                                                                <DropdownItem onClick={() => { handleDisplayClick(invoice) }}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-eye" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Display
                                                                    </span>
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleEditClick(invoice)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-gear" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Edit
                                                                    </span>
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSavePaymentClick(invoice)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-dollar-sign" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Save payment
                                                                    </span>
                                                                </DropdownItem>

                                                                <DropdownItem divider />
                                                                <DropdownItem onClick={() => handleDeleteClick(invoice._id)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-trash text-danger" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Delete
                                                                    </span>
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                    </td> */}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div style={{ textAlign: 'center' }}>
                          <i className="fa-solid fa-ban" style={{ display: 'block', marginBottom: '10px', fontSize: '50px', opacity: '0.5' }}></i>
                          No invoices found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col className="mb-5 mb-xl-0" xl="6">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Recent Sent invoices</h3>
                  </div>
                  <div className="col text-right">
                    <Link to="/admin/proforma-invoice">
                      <Button color="primary" size="sm">
                        See all
                      </Button>
                    </Link>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Number</th>
                    <th scope="col">Client</th>
                    <th scope="col">Total </th>
                    <th scope="col">Status</th>
                    <th scope="col"></th>

                  </tr>
                </thead>
                <tbody>
                  {filteredProformaInvoices.length > 0 ? (
                    filteredProformaInvoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td>{invoice.number}</td>
                        <td>{getClientNameById(invoice.client._id)}</td>

                        <td>
                          {invoice.currency ? getCurrencySymbolById(invoice.currency._id, invoice.total) : 'Currency Not Available'}
                        </td>



                        <td>
                          <Badge color={getStatusStyle(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>


                        {/* <td>
                                                        <Dropdown isOpen={dropdownOpen === invoice._id} toggle={() => toggleDropdown(invoice._id)} >
                                                            <DropdownToggle tag="span" data-toggle="dropdown" style={{ cursor: 'pointer' }}>
                                                                <FontAwesomeIcon icon={faEllipsisH} style={{ fontSize: '1rem' }} />
                                                            </DropdownToggle>
                                                            <DropdownMenu right style={{ marginTop: "-25px" }}>
                                                                <DropdownItem onClick={() => { handleDisplayClick(invoice) }}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-eye" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Display
                                                                    </span>
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleEditClick(invoice)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-gear" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Edit
                                                                    </span>
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSavePaymentClick(invoice)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-dollar-sign" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Save payment
                                                                    </span>
                                                                </DropdownItem>

                                                                <DropdownItem divider />
                                                                <DropdownItem onClick={() => handleDeleteClick(invoice._id)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-trash text-danger" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Delete
                                                                    </span>
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                    </td> */}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div style={{ textAlign: 'center' }}>
                          <i className="fa-solid fa-ban" style={{ display: 'block', marginBottom: '10px', fontSize: '50px', opacity: '0.5' }}></i>
                          No invoices found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
