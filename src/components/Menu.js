  // Done by: Jana Hani Sandeyouni

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { io } from 'socket.io-client';
import '../fonts.css';
import './Menu.css';

const socket = io('http://localhost:4000');

const Menu = () => {
  const [order, setOrder] = useState({
    name: '',
    department: '',
    items: [],
    temperature: {},
  });
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuSectionRef = useRef(null);
  const scrollButtonsRef = useRef(null);
  const CarouselSectionRef = useRef(null);
  const SubmitOrderSectionRef = useRef(null);
  const HeaderSectionRef =useRef(null);

  const allDepartments = [
    "Chairman Office", "CEO Office", "Digital & IOT Department", "Finance Department", "Legal Department",
    "Business Development Department", "Strategy Management Office", "Project Management Office",
    "Compliance and Risk Department", "Brand & Communications", "Information Technology",
    "Human Resources Department", "Human Resources Information Systems Unit", "Payroll", "Proparty",
    "Talent Acquisition Unit", "Shared Services", "Organization Development", "Total Rewards",
    "Happiness & Engagement Unit", "HR Business Partners Unit", "Admin and Facility Unit",
    "Companies Affairs", "Inovation Lab", "Meeting Room -1-", "Meeting Room -2-", "Meeting Room -3-",
    "Meeting Room -4-", "Meeting Room -5-", "Meeting Room -6-", "Meeting Room -7-", "Meeting Room -8-",
    "Meeting Room -9-", "Meeting Room -10-",
  ];

  const scrollTobuttonSection = () => {
    SubmitOrderSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    
  };

  const scrollToCarousel = () => {
    HeaderSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const menuSection = menuSectionRef.current;
      const scrollButtons = scrollButtonsRef.current;
      const scrollPosition = window.scrollY + window.innerHeight;

      if (menuSection && scrollButtons) {
        const menuSectionPosition = menuSection.offsetTop + menuSection.offsetHeight;

        if (scrollPosition >1000) {
          scrollButtons.classList.add('visible');
        } else {
          scrollButtons.classList.remove('visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToMenuSection = () => {
    menuSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const departmentOptions = allDepartments.map(department => ({
    label: department,
    value: department,
  }));

  // Fetch menu items from the server
  useEffect(() => {
    socket.on('initialMenuItems', (initialMenuItems) => {
      setMenuItems(initialMenuItems || []);
    });

    socket.on('menuItemAdded', (addedItem) => {
      setMenuItems((prevMenuItems) => [...prevMenuItems, addedItem]);
    });

    socket.on('menuItemDeleted', (deletedItem) => {
      setMenuItems((prevMenuItems) =>
        prevMenuItems.filter((item) => item.name !== deletedItem.name)
      );
    });

    return () => {
      socket.off('initialMenuItems');
      socket.off('menuItemAdded');
      socket.off('menuItemDeleted');
    };
  }, []);

  // Filter menu items based on search query
  useEffect(() => {
    setFilteredMenuItems(
      menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [menuItems, searchQuery]);

  // Animate menu items when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = document.querySelectorAll('.menu-section .cards');
    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, [filteredMenuItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  const handleCheckboxChange = (e, item) => {
    const { name, checked } = e.target;
    let items = order.items;

    if (checked) {
      items.push({ ...item, option: name });
    } else {
      items = items.filter(
        (orderItem) =>
          orderItem.name !== item.name || orderItem.option !== name
      );
    }
    setOrder({ ...order, items });
  };

  const handleRadioChange = (e, item) => {
    const { name, value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      temperature: { ...prevOrder.temperature, [item.name]: value },
    }));
  };

  const handleEspressoOptionChange = (e, item) => {
    const { value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items
        .filter((orderItem) => orderItem.name !== item.name)
        .concat({ ...item, option: value }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;

    const nameInput = document.querySelector('.name2');
    const departmentSelect = document.querySelector('.dep2');
    const menuItemsSection = document.querySelector('.menu-section');

    if (nameInput) nameInput.classList.remove('error');
    if (departmentSelect) departmentSelect.classList.remove('error');
    if (menuItemsSection) menuItemsSection.classList.remove('error');

    if (order.name.trim() === '') {
      if (nameInput) {
        nameInput.scrollIntoView({ behavior: 'smooth' });
        nameInput.focus();
        nameInput.classList.add('error');
        hasError = true;
      }
    }

    if (order.department.trim() === '') {
      if (departmentSelect) {
        departmentSelect.scrollIntoView({ behavior: 'smooth' });
        departmentSelect.focus();
        departmentSelect.classList.add('error');
        hasError = true;
      }
    }

    if (order.items.length === 0) {
      if (menuItemsSection) {
        menuItemsSection.scrollIntoView({ behavior: 'smooth' });
        menuItemsSection.focus();
        menuItemsSection.classList.add('error');
        hasError = true;
      }
    }

    if (!hasError) {
      setShowConfirmation(true);
    }
  };

  const confirmOrder = () => {
    socket.emit('newOrder', order);
    setShowConfirmation(false);
    setOrder({
      name: '',
      department: '',
      items: [],
      temperature: {},
    });
    document.getElementById('orderForm').reset();
    alert('Thanks for ordering! Your coffee will delivered to you soon.');
  };

  const cancelOrder = () => {
    setShowConfirmation(false);
  };



  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDepartmentChange = (newValue) => {
    setOrder({ ...order, department: newValue.value });
  };

  return (
    <div>
      <header className="header" ref={HeaderSectionRef} >
        <div>
          <h1 className="custom-font header-title">ALJE Digital Café</h1>
        </div>
        <div>
          <img src="/logo3.png" alt="Logo" className="logo-image" />
        </div>
      </header>

      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel" ref={CarouselSectionRef}>
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <section className="cta">

            <div className=' justify-content-center align-items-center d-flex text-div'>

          
              <div className="cta-text">
                <h1 className="cta-title">
                  Your <span>Coffee</span> comes to your office
                </h1>
              </div>

              

              <div className="cta-image flex-1 flex" >
                <img src="/cofeeesp.png" alt="hero image" className="hero-image w-[200px] sm:w-[200px] sm:scale-110 spin" />
              </div>

              </div>

              <div className="hero-overlay">
                <form className="form-s mt-3">
                  <div className="row mb-3">
                    <div className=" col text-center">
                      <input type="text" className="name1 name2 form-control" placeholder="Enter your name" name="name" value={order.name} onChange={handleChange} required  style={{ color:"gray"}} />
                    </div>
                    <div className="dep1 col" >
                      <Select
                        className="dep2 form-control"
                        name="department"
                        options={departmentOptions}
                        menuPlacement="top"
                        value={departmentOptions.find(option => option.value === order.department)}
                        onChange={handleDepartmentChange}
                        placeholder="Department"
                        required
                      />
                    </div>
                  </div>
                </form>
                <button className="order-now-button" onClick={scrollToMenuSection}>
                  Order Now <i className="bi bi-arrow-down"></i>
                </button>

              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="menu-section" ref={menuSectionRef}>
        <div className="container">
          <h1 className="sections-title mb-5">Cafe Menu</h1>

          

    <div className="search-field mb-4">
            <div className="input-group">
              <input type="text" 
              className="form-control" 
              placeholder="Search for your favorite coffee..." 
              value={searchQuery} 
              onChange={handleSearch}
               aria-describedby="search-icon" />
              <span className="input-group-text" id="search-icon">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>


          <form id="orderForm" onSubmit={handleSubmit} className="container">
            <div className="forms-section">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <div key={item.name} className="cards mx-3 mb-3">
                    <div className="cards-body">
                      <div>
                        <h5 className="cards-title">{item.name}</h5>
                        <p className="cards-description">
                          A little spark of heaven mixed with smoothness that will leave you in awe.
                        </p>
                        {item.name === 'Espresso' ? (
                          ['Single', 'Double'].map((option) => (
                            <div key={option} className="form-check">
                              <input className="form-check-input" type="checkbox" id={`${item.name}-${option}`} name={option} onChange={(e) => handleCheckboxChange(e, item)} />
                              <label className="form-check-label" htmlFor={`${item.name}-${option}`}>{option}</label>
                            </div>
                          ))
                        ) : (
                          ['Sugar', 'Milk'].map((option) => (
                            <div key={option} className="form-check">
                              <input className="form-check-input" type="checkbox" id={`${item.name}-${option}`} name={option} onChange={(e) => handleCheckboxChange(e, item)} />
                              <label className="form-check-label" htmlFor={`${item.name}-${option}`}>{option}</label>
                            </div>
                          ))
                        )}
                        <div className="form-check">
                          <input className="form-check-input" type="radio" id={`${item.name}-Ice`} name={`${item.name}-temperature`} value="Ice" checked={order.temperature[item.name] === 'Ice'} onChange={(e) => handleRadioChange(e, item)} />
                          <label className="form-check-label" htmlFor={`${item.name}-Ice`}>Ice</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" id={`${item.name}-Hot`} name={`${item.name}-temperature`} value="Hot" checked={order.temperature[item.name] === 'Hot'} onChange={(e) => handleRadioChange(e, item)} />
                          <label className="form-check-label" htmlFor={`${item.name}-Hot`}>Hot</label>
                        </div>
                      </div>
                      <img src="/espresso.jpeg" alt="Coffee" className="menu-item-image" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">No items found.</div>
              )}
            </div>

            <button type="submit" className="btn-submit btn-2 btn-block mt-4"  ref={SubmitOrderSectionRef}>
              Submit Order
            </button>
          </form>

          <div className="scroll-buttons" ref={scrollButtonsRef}>
  <button
    className="scroll-button"
    onClick={scrollToCarousel}
    aria-label="Scroll to Carousel"
  >
    <i className="bi bi-arrow-up-circle-fill"></i>
  </button>
  <button
    className="scroll-button"
    onClick={scrollTobuttonSection}
    aria-label="Scroll to Menu Section"
  >
    <i className="bi bi-arrow-down-circle-fill"></i>
  </button>
</div>

          {showConfirmation && (
            <div className="modal fade show custom-modal" id="confirmationModal" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true" style={{ display: 'block' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="confirmationModalLabel">Confirm Order</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={cancelOrder}></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Name:</strong> {order.name}</p>
                    <p><strong>Department:</strong> {order.department}</p>
                    <p><strong>Items:</strong> {order.items.map((item) => `${item.name} (${item.option || 'Standard'})`).join(', ')}</p>
                    <p><strong>Temperature:</strong> {Object.keys(order.temperature).map((item) => `${item}: ${order.temperature[item]}`).join(', ')}</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-no btn-secondary" onClick={cancelOrder}>No</button>
                    <button type="button" className="btn-yes btn-primary" onClick={confirmOrder}>Yes</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        
      </div>

  
 
      
      <footer className="footer opacity-55 custom-font">
        <div className="footer-container">
          <p className="footer-text">© 2024 Abdul Latif Jameel Enterprises. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
