import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    Card,
    CardHeader,
    CardFooter,
    Input,
    Table,
    Container,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Label,
} from 'reactstrap';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { getCountryCallingCode, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import Header from 'components/Headers/ElementHeader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Flag from 'react-world-flags';

const decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
};

const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
        <div ref={innerRef} {...innerProps} className="custom-option">
            <Flag code={data.value} style={{ width: 24, height: 16, marginRight: 10 }} />
            {data.label}
        </div>
    );
};

const CustomSingleValue = (props) => {
    const { data } = props;
    return (
        <div className="custom-single-value">
            <Flag code={data.value} style={{ width: 24, height: 16, marginRight: 10 }} />
            {data.label} 
            
        </div>
    );
};

const CompanyComponent = () => {
    const [company, setCompany] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [selectedLogoName, setSelectedLogoName] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState(null);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [taxNumber, setTaxNumber] = useState('');
    const [vatNumber, setVatNumber] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');

    const token = localStorage.getItem('token');
    const decodedToken = token ? decodeToken(token) : {};
    const currentUserId = decodedToken.AdminID;

    const options = countryList().getData().map(country => ({
        value: country.value, 
        label: country.label 
    }));

    useEffect(() => {
        fetchCompany();
    }, [currentUserId]);

    const fetchCompany = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/companysetting/getByCreatedBy/${currentUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data;
            setCompany(data);
            setName(data.name);
            setAddress(data.address);
            setState(data.state);
            setCountry(options.find(opt => opt.value === data.country));
            setEmail(data.email);
            setPhone(data.phone);
            setWebsite(data.website);
            setTaxNumber(data.taxNumber);
            setVatNumber(data.vatNumber);
            setRegistrationNumber(data.registrationNumber);
        } catch (error) {
            console.error('Error fetching company data:', error);
        }
    };

    const handleCountryChange = (selectedOption) => {
        setCountry(selectedOption);
        const countryCode = selectedOption?.value ? `+${getCountryCallingCode(selectedOption.value)}` : "";

        const formattedPhone = phone.replace(/^\+\d+\s*/, '');
        setPhone(`${countryCode} ${formattedPhone}`);
    };

    const validatePhoneNumber = (phoneNumber, countryCode) => {
        try {
            const phoneNumberObj = parsePhoneNumber(phoneNumber, countryCode);
            return phoneNumberObj.isValid();
        } catch (error) {
            return false;
        }
    };

    const handleUpdateCompany = async () => {
        const countryCode = country?.value;

        if (countryCode && !validatePhoneNumber(phone, countryCode)) {
            toast.error(`Invalid phone number for ${country?.label}. Please check the number format.`);
            return;
        }

        try {
            const companyData = {
                name,
                address,
                state,
                country: country?.value,
                email,
                phone,
                website,
                taxNumber,
                vatNumber,
                registrationNumber,
                createdBy: currentUserId,
            };
            await axios.post('http://localhost:5000/api/companysetting/createOrUpdate', companyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Company information updated successfully');
            fetchCompany(); 
            toggleModal(); 
        } catch (error) {
            console.error('Error updating company:', error);
            toast.error('Error updating company information');
        }
    };

    const handleLogoUpload = async () => {
        if (logoFile) {
            const formData = new FormData();
            formData.append('logo', logoFile);

            try {
                await axios.post(`http://localhost:5000/api/companysetting/uploadOrUpdateLogo/${currentUserId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Logo uploaded successfully');
                fetchCompany();
                setLogoFile(null); 
                setSelectedLogoName(''); 
            } catch (error) {
                console.error('Error uploading logo:', error);
                toast.error('Error uploading logo');
            }
        } else {
            toast.warning('No logo file selected');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogoFile(file);
        setSelectedLogoName(file ? file.name : '');
    };

    const handleFileInputClick = () => {
        document.getElementById('logo-upload').click();
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    return (
        <>
            <ToastContainer />
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Company Information</h3>
                                {company?.logo && (
                                    <div className="logo-container">
                                        <img
                                            src={`http://localhost:5000/${company.logo}`}
                                            alt="Company Logo"
                                            style={{
                                                borderRadius: '50%',
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                )}
                                <Button color="primary" onClick={toggleModal}>
                                    Edit Company Info
                                </Button>
                            </CardHeader>
                            <Table className="align-items-center table-flush" responsive>
                                <tbody>
                                    <tr>
                                        <td>Name:</td>
                                        <td>{company?.name}</td>
                                    </tr>
                                    <tr>
                                        <td>Address:</td>
                                        <td>{company?.address}</td>
                                    </tr>
                                    <tr>
                                        <td>State:</td>
                                        <td>{company?.state}</td>
                                    </tr>
                                    <tr>
                                        <td>Country:</td>
                                        <td>{company?.country}</td>
                                    </tr>
                                    <tr>
                                        <td>Email:</td>
                                        <td>{company?.email}</td>
                                    </tr>
                                    <tr>
                                        <td>Phone:</td>
                                        <td>{company?.phone}</td>
                                    </tr>
                                    <tr>
                                        <td>Website:</td>
                                        <td>{company?.website}</td>
                                    </tr>
                                    <tr>
                                        <td>Tax Number:</td>
                                        <td>{company?.taxNumber}</td>
                                    </tr>
                                    <tr>
                                        <td>VAT Number:</td>
                                        <td>{company?.vatNumber}</td>
                                    </tr>
                                    <tr>
                                        <td>Registration Number:</td>
                                        <td>{company?.registrationNumber}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            <CardFooter className="py-4">
                                <Button color="secondary" onClick={handleLogoUpload}>
                                    Upload Logo
                                </Button>
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{
                                        display: 'none',
                                    }}
                                />
                                <Button
                                    color="secondary"
                                    onClick={handleFileInputClick}
                                    style={{
                                        marginLeft: '10px',
                                    }}
                                >
                                    {selectedLogoName || 'Choose Logo File'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </Row>
                <Modal isOpen={modalOpen} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Edit Company Information</ModalHeader>
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
                            <Label for="address">Address</Label>
                            <Input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="state">State</Label>
                            <Input
                                type="text"
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="country">Country</Label>
                            <Select
                                id="country"
                                options={options}
                                value={country}
                                onChange={handleCountryChange}
                                placeholder="Select country"
                                components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="phone">Phone</Label>
                            <Input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="website">Website</Label>
                            <Input
                                type="text"
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="taxNumber">Tax Number</Label>
                            <Input
                                type="text"
                                id="taxNumber"
                                value={taxNumber}
                                onChange={(e) => setTaxNumber(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="vatNumber">VAT Number</Label>
                            <Input
                                type="text"
                                id="vatNumber"
                                value={vatNumber}
                                onChange={(e) => setVatNumber(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="registrationNumber">Registration Number</Label>
                            <Input
                                type="text"
                                id="registrationNumber"
                                value={registrationNumber}
                                onChange={(e) => setRegistrationNumber(e.target.value)}
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleUpdateCompany}>
                            Save Changes
                        </Button>
                        <Button color="secondary" onClick={toggleModal}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </>
    );
};

export default CompanyComponent;
