import React from 'react';
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Company from "views/examples/Companies/Company";
import Clients from "views/examples/Clients/Clients";
import Register from "views/examples/Auth/Register";
import Login from "views/examples/Auth/Login";
import Tables from "views/examples/Tables.js";
import Person from "views/examples/Persons/Persons";
import ForgotPassword from "views/examples/Auth/ForgotPassword";
import ProductCategory from "views/examples/ProductCategory/ProductCategory";
import Product from "views/examples/Products/Products";
import ExpenseCategory from "views/examples/ExpensesCategory/ExpensesCategory";
import Expenses from "views/examples/Expenses/Expenses";
import Currency from "views/examples/Currency/Currency";
import Taxes from "views/examples/Taxes/Taxes";
import Mycompany from "views/examples/Mycompany/Mycompany";
import Invoices from "views/examples/Invoices/Invoices";
import ProformaInvoice from "views/examples/ProformaInvoice/ProformaInvoice";
import Payment from "views/examples/Payment/Payment";
import Report from "views/examples/Report/Report";








const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const token = localStorage.getItem('token');
const decodedToken = token ? decodeToken(token) : {};
const currentUserId = decodedToken.AdminID;

const isAuthenticated = !!currentUserId; 
const routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/persons",
    name: "Personne",
    icon: "ni ni-circle-08 text-blue",
    component: <Person />,
    layout: "/admin",
  },
  {
    path: "/company",
    name: "Entreprise",
    icon: "ni ni-building text-orange",
    component: <Company />,
    layout: "/admin",
  },
  {
    path: "/clients",
    name: "Clients",
    icon: "ni ni-single-02 text-yellow",
    component: <Clients />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "fa-regular fa-user text-red",
    component: <Profile />,
    layout: "/admin",
  },
  {
    path: "/product-category",
    name: "Service",
    icon: "fa-solid fa-ticket text-green",
    component: <ProductCategory />,
    layout: "/admin",
  },
  
  // {
  //   path: "/expense-category",
  //   name: "Expense Category",
  //   icon: "fa-solid fa-ticket text-blue",
  //   component: <ExpenseCategory />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/expenses",
  //   name: "Expenses",
  //   icon: "fa-solid fa-wallet text-blue",
  //   component: <Expenses />,
  //   layout: "/admin",
  // },
  {
    path: "/invoices",
    name: "Factures reçues ",
    icon: "fa-solid fa-file-invoice-dollar text-red",
    component: <Invoices />,
    layout: "/admin",

    
  },
  {
    path: "/proforma-invoice",
    name: "Factures envoyées",
    icon: "fa-solid fa-file-invoice text-blue",
    component: <ProformaInvoice />,
    layout: "/admin",

    
  },

  {
    path: "/payment",
    name: "Payments",
    icon: "fa-solid fa-credit-card text-yellow",
    component: <Payment />,
    layout: "/admin",

    
  },
  {
    path: "/report",
    name: "Report",
    icon: "fa-solid fa-chart-pie text-green",
    component: <Report />,
    layout: "/admin",

    
  },
  {
    path: "/currencies",
    name: "Devise",
    component: <Currency />,
    layout: "/admin",
  },
  {
    path: "/taxes",
    name: "Taxes",
    component: <Taxes />,
    layout: "/admin",
  },
  {
    path: "/mycompany",
    name: "Mon entreprise",
    component: <Mycompany />,
    layout: "/admin",
  },
  // {
  //   path: "/tables",
  //   name: "Tables",
  //   icon: "ni ni-bullet-list-67 text-red",
  //   component: <Tables />,
  //   layout: "/admin",
  // },
  !isAuthenticated && {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  !isAuthenticated && {
    path: "/register",
    component: <Register />,
    layout: "/auth",
  },
  !isAuthenticated && {
    path: "/forgot-password",
    component: <ForgotPassword />,
    layout: "/password-reset",
  }
].filter(Boolean); 
export default routes;
