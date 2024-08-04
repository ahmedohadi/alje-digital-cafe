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
    const [quantities, setQuantities] = useState({});
    const [sugarTypeChosen, setSugarTypeChosen] = useState({});
    const menuSectionRef = useRef(null);
    const scrollButtonsRef = useRef(null);
    const CarouselSectionRef = useRef(null);
    const SubmitOrderSectionRef = useRef(null);
    const HeaderSectionRef = useRef(null);
    const [sugarQuantities, setSugarQuantities] = useState({});

    const allDepartments = [
        "Chairman Office", "CEO Office", "Digital & IOT Department", "Finance Department", 
        "Legal Department", "Business Development Department", "Strategy Management Office", 
        "Project Management Office", "Compliance and Risk Department", "Brand & Communications", 
        "Information Technology", "Human Resources Department", "Human Resources Information Systems Unit", 
        "Payroll", "Proparty", "Talent Acquisition Unit", "Shared Services", "Organization Development", 
        "Total Rewards", "Happiness & Engagement Unit", "HR Business Partners Unit", "Admin and Facility Unit", 
        "Companies Affairs", "Inovation Lab", "Meeting Room -1-", "Meeting Room -2-", "Meeting Room -3-", 
        "Meeting Room -4-", "Meeting Room -5-", "Meeting Room -6-", "Meeting Room -7-", 
        "Meeting Room -8-", "Meeting Room -9-", "Meeting Room -10-",
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
                if (scrollPosition > 1000) {
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

    useEffect(() => {
        socket.on("initialMenuItems", (initialMenuItems) => {
            setMenuItems(initialMenuItems);
            setFilteredMenuItems(initialMenuItems);

            const initialQuantities = {};
            initialMenuItems.forEach(item => {
                initialQuantities[item.name] = 1; // Default quantity is 1
            });
            setQuantities(initialQuantities);
        });

        socket.on('menuItemAdded', (addedItem) => {
            setMenuItems((prevMenuItems) => [...prevMenuItems, addedItem]);
        });

        socket.on('menuItemDeleted', (deletedItem) => {
            setMenuItems((prevMenuItems) => prevMenuItems.filter((item) => item.name !== deletedItem.name));
        });

        return () => {
            socket.off('initialMenuItems');
            socket.off('menuItemAdded');
            socket.off('menuItemDeleted');
        };
    }, []);

    useEffect(() => {
        setFilteredMenuItems(
            menuItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [menuItems, searchQuery]);

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

    const handleIncrement = (itemName) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [itemName]: prevQuantities[itemName] + 1,
        }));
    };

    const handleDecrement = (itemName) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [itemName]: Math.max(1, prevQuantities[itemName] - 1), // Minimum quantity is 1
        }));
    };

    const handleSugarQuantityChange = (itemName, sugarType, quantityChange) => {
      setSugarQuantities((prevSugarQuantities) => ({
        ...prevSugarQuantities,
        [itemName]: {
          ...prevSugarQuantities[itemName],
          [sugarType]: Math.max(0, (prevSugarQuantities[itemName][sugarType] || 0) + quantityChange),
        },
      }));
      setSugarTypeChosen((prevSugarTypeChosen) => ({
        ...prevSugarTypeChosen,
        [itemName]: true,
      }));
    };
    const handleCheckboxChange = (e, item) => {
      const { name, checked } = e.target;
      let items = [...order.items]; // Create a new copy of the array
   
      if (name === "Milk") {
        const existingItem = items.find((orderItem) => orderItem.name === item.name);
        if (checked) {
          if (existingItem) {
            existingItem.option = "Milk";
          } else {
            items.push({ ...item, option: "Milk", temperature: order.temperature[item.name] });
          }
        } else {
          if (existingItem) {
            existingItem.option = undefined;
          }
        }
      } else { // Handle other checkboxes as before
        if (checked) {
          items.push({ ...item, option: name, temperature: order.temperature[item.name] });
        } else {
          items = items.filter((orderItem) => orderItem.name !== item.name);
        }
        // Initialize sugar quantities for the menu item if it doesn't exist
        if (!sugarQuantities[item.name]) {
          setSugarQuantities((prevSugarQuantities) => ({
            ...prevSugarQuantities,
            [item.name]: {
              white: 0,
              brown: 0,
              diet: 0,
            },
          }));
        }
      }
   
      setOrder({ ...order, items });
    };
    // const handleCheckboxChange = (e, item) => {
    //   const { name, checked } = e.target;
    //   let items = order.items;
    
    //   if (checked) {
    //     items.push({
    //       ...item,
    //       option: name,
    //       temperature: order.temperature[item.name],
    //     });
    //   } else {
    //     items = items.filter((orderItem) => orderItem.name !== item.name || orderItem.option !== name);
    //   }
    
    //   setOrder({ ...order, items });
    // };

    const handleRadioChange = (e, item) => {
        const { name, value } = e.target;
        setOrder((prevOrder) => {
            let updatedItems = prevOrder.items.filter((orderItem) => orderItem.name !== item.name);

            if (value !== "") {
                updatedItems.push({ ...item, temperature: value });
            }

            return {
                ...prevOrder,
                items: updatedItems,
                temperature: { ...prevOrder.temperature, [item.name]: value },
            };
        });
    };

    const handleEspressoOptionChange = (e, item) => {
        const { value } = e.target;
        setOrder((prevOrder) => ({
            ...prevOrder,
            items: prevOrder.items
                .filter((orderItem) => orderItem.name !== item.name)
                .concat({
                    ...item,
                    option: value,
                    temperature: order.temperature[item.name],
                }),
        }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
    
      let hasError = false;
    
        const nameInput = document.querySelector('.name2');
        const departmentSelect = document.querySelector('.dep2');
        
    
        if (nameInput) nameInput.classList.remove('error');
        if (departmentSelect) departmentSelect.classList.remove('error');
        
    
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
    
       
    
        // Check if temperature is selected for each item
      order.items.forEach((item) => {
        const temperatureInput = document.querySelector(`input[name="${item.name}-temperature"]:checked`);
        if (!temperatureInput) {
          const menuItemCard = document.querySelector(`.cards[data-item-name="${item.name}"]`);
          if (menuItemCard) {
            menuItemCard.scrollIntoView({ behavior: 'smooth' });
            menuItemCard.classList.add('error');
            hasError = true;
          }
        }
      });
    
        if (!hasError) {
          const itemsWithQuantities = order.items.map((item) => ({
            ...item,
            quantity: quantities[item.name],
            sugarQuantities: formatSugarQuantities(sugarQuantities[item.name])
          }));
          setOrder({ ...order, items: itemsWithQuantities });
          setShowConfirmation(true);
        }else {
          // alert('Please select temperature for each item');
        }
    };
    
    const formatSugarQuantities = (sugarQuantities) => {
      const formattedSugarQuantities = {};
      if (sugarQuantities && sugarQuantities.white) {
        formattedSugarQuantities.white = sugarQuantities.white;
      }
      if (sugarQuantities && sugarQuantities.brown) {
        formattedSugarQuantities.brown = sugarQuantities.brown;
      }
      if (sugarQuantities && sugarQuantities.diet) {
        formattedSugarQuantities.diet = sugarQuantities.diet;
      }
      return formattedSugarQuantities;
    };
    const confirmOrder = () => {
      const newOrder = {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          temperature: order.temperature[item.name],
          quantity: quantities[item.name],
          option: item.option,
          sugarQuantities: sugarQuantities[item.name] || {},
        })),
      };
    
      socket.emit("newOrder", newOrder);
      setShowConfirmation(false);
      setOrder({ name: "", department: "", items: [], temperature: {} });
      setQuantities(menuItems.reduce((acc, item) => ({ ...acc, [item.name]: 1 }), {}));
      document.getElementById("orderForm").reset();
      alert('Thanks for ordering! Your coffee will be delivered to you soon.');
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

    const itemImages = {
        "Black Coffee": "/blackcoffee.jpeg",
        Espresso: "/espresso.jpeg",
        "Flat White": "/flat-white.jpeg",
        "Green Tea": "/green-tea.jpeg",
        Latte: "/latte.jpeg",
        Macchiato: "/meccato.jpeg",
        "Red Tea": "/red-tea.jpeg",
        "Arabic Coffee": "/saudiicoffee.jpeg",
        "Special Coffee": "/blackcoffee.jpeg",
        Ristretto: "/espresso.jpeg",
        Cappuccino: "/Cappuccino.jpeg",
        "Turkish Coffee": "/Turkish-Coffee.jpeg",
        Nescafe: "/Nescafe.jpeg",
        "Nescafe 3 in 1": "/Nescafe.jpeg",
    };

    return(
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


     <div className="forms-section" ref={menuSectionRef}>
     {filteredMenuItems.map((item) => (
  <div key={item.name} className="cards mx-3 mb-3" data-item-name={item.name}>
      <div className="cards-body">
       
        <div className="card-body">
          <h5  className="cards-title">{item.name}</h5>
          {item.name !== "Espresso" && (
  <div key="sugar" className="form-check">
    
    <input
      className="form-check-input"
      type="checkbox"
      id={`${item.name}-sugar`}
      name="sugar"
      onChange={(e) => handleCheckboxChange(e, item)}
    />
    
    <label
      className="form-check-label"
      htmlFor={`${item.name}-sugar`}
    >
     Sugar
    </label>
    {sugarQuantities[item.name] && (sugarQuantities[item.name].white > 0 || sugarQuantities[item.name].brown > 0 || sugarQuantities[item.name].diet > 0) && (
      <i className="bi bi-check-circle-fill text-success ms-2"></i>
      
    )}
    
   
     
    
    {order.items.some((orderItem) => orderItem.name === item.name && orderItem.option === "sugar") && (
      
      <div className="sugar-types mt-2">
        <div className="form-check form-check-inline">
          {/* <input
            className="form-check-input"
            type="checkbox"
            id={`${item.name}-white-sugar`}
            name="white-sugar"
          /> */}
          <label className="form-check-label" htmlFor={`${item.name}-white-sugar`}>
            White
          </label>
          {sugarQuantities[item.name] && sugarQuantities[item.name].white > 0 && (
            <i className="bi bi-check-circle-fill text-success ms-2"></i>
          )}
        </div>
        <div className="quantity-controls mt-3 d-flex align-items-center justify">
          <button
            type="button"
            className="btn-suger  align-middle btn-outline-secondary"
            onClick={() => handleSugarQuantityChange(item.name, "white", -1)}
          >
            <span className="align-top">-</span>
          </button>
          <span className="mx-3">{sugarQuantities[item.name] && sugarQuantities[item.name].white}</span>
          <button
            type="button"
            className="btn-suger text-center align-baseline btn-outline-danger"
            onClick={() => handleSugarQuantityChange(item.name, "white", 1)}
          >
            +
          </button>
        </div>
        <div className="form-check form-check-inline">
         
          <label className="form-check-label" htmlFor={`${item.name}-brown-sugar`}>
            Brown
          </label>
          {sugarQuantities[item.name] && sugarQuantities[item.name].brown > 0 && (
            <i className="bi bi-check-circle-fill text-success ms-2"></i>
          )}
        </div>
        <div className="quantity-controls">
          <button
            type="button"
            className="btn-suger  btn-outline-secondary"
            onClick={() => handleSugarQuantityChange(item.name, "brown", -1)}
          >
            -
          </button>
          <span className="mx-3">{sugarQuantities[item.name] && sugarQuantities[item.name].brown}</span>
          <button
            type="button"
            className="btn-suger  btn-outline-danger"
            onClick={() => handleSugarQuantityChange(item.name, "brown", 1)}
          >
            +
          </button>
        </div>
        <div className="form-check form-check-inline">
          {/* <input
            className="form-check-input"
            type="checkbox"
            id={`${item.name}-diet-sugar`}
            name="diet-sugar"
          /> */}
          <label className="form-check-label" htmlFor={`${item.name}-diet-sugar`}>
            Diet
          </label>
          {sugarQuantities[item.name] && sugarQuantities[item.name].diet > 0 && (
            <i className="bi bi-check-circle-fill text-success ms-2"></i>
          )}
        </div>
        <div className="quantity-controls">
          <button
            type="button"
            className="btn-suger  btn-outline-secondary"
            onClick={() => handleSugarQuantityChange(item.name, "diet", -1)}
          >
            -
          </button>
          <span className="mx-3">{sugarQuantities[item.name] && sugarQuantities[item.name].diet}</span>
          <button
            type="button"
            className="btn-suger  btn-outline-danger"
            onClick={() => handleSugarQuantityChange(item.name, "diet", 1)}
          >
            +
          </button>
        </div>
      </div>
    )}

    
  </div>
  
)}
          {item.name === "Espresso"
            ? ["Single", "Double"].map((option) => (
                <div key={option} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`${item.name}-${option}`}
                    name={`${item.name}-option`}
                    value={option}
                    checked={order.items.some(
                      (orderItem) =>
                        orderItem.name === item.name &&
                        orderItem.option === option
                    )}
                    onChange={(e) => handleEspressoOptionChange(e, item)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`${item.name}-${option}`}
                  >
                    {option}
                  </label>
                </div>
              ))

              : ["Milk"].map((option) => (
                <div key={option} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${item.name}-${option}`}
                    name={option}
                    onChange={(e) => handleCheckboxChange(e, item)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`${item.name}-${option}`}
                  >
                    {option}
                  </label>
                </div>

                
              ))}


                {/* <div key="Milk" className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="milk"
                    name="Milk"
                    onChange={(e) => handleCheckboxChange(e, item)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="milk"
                  >
                    Milk
                  </label>
                </div> */}

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id={`${item.name}-Ice`}
              name={`${item.name}-temperature`}
              value="Ice"
              checked={order.temperature[item.name] === "Ice"}
              onChange={(e) => handleRadioChange(e, item)}
            />
            <label
              className="form-check-label"
              htmlFor={`${item.name}-Ice`}
            >
              Ice
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id={`${item.name}-Hot`}
              name={`${item.name}-temperature`}
              value="Hot"
              checked={order.temperature[item.name] === "Hot"}
              onChange={(e) => handleRadioChange(e, item)}
            />
            <label
              className="form-check-label"
              htmlFor={`${item.name}-Hot`}
            >
              Hot
            </label>
        
            
          </div>
        
          <div className="quantity-controls mt-3 d-flex justify-content-center align-items-center">
          <h8 className="cups">Cup(s): </h8>
                      <button 
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleDecrement(item.name)}
                      >
                        -
                      </button>
                      <span className="mx-3">{quantities[item.name]}</span>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleIncrement(item.name)}
                      >
                        +
                      </button>
                    </div>
          
        </div>
        <img
          src={item.image || itemImages[item.name]}
          alt={item.name}
          className=" menu-item-image"
          
        />

        
      </div>

      
    </div>
  ))}
</div>

          <form id="orderForm" onSubmit={handleSubmit} className="container">
           

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
  <div className="modal fade show custom-modal" id="confirmationModal" tabIndex="-1" aria-labelledby="confirmationModalLabel" style={{ display: 'block' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="confirmationModalLabel">Confirm Order</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={cancelOrder}></button>
        </div>
        <div className="modal-body">
          <p><strong>Name:</strong> {order.name}</p>
          <p><strong>Department:</strong> {order.department}</p>
          <p><strong>Items:</strong> {order.items.map((item) => `${item.name} x ${quantities[item.name]}`).join(', ')}</p> 
          <p>
  <strong>Milk addition:</strong>{" "}
  {Object.entries(order.items.reduce((acc, item) => {
    acc[item.name] = item.option === "Milk" ? `${item.name} (Milk)` : `${item.name} (Without Milk)`;
    return acc;
  }, {})).map(([key, value]) => value).join(", ")}
</p>
          <p><strong>Sugar Quantities:</strong> {order.items.map((item) => `${item.name}: ${JSON.stringify(item.sugarQuantities)}`).join(', ')}</p>
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

