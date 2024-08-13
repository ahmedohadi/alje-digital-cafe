import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { io } from "socket.io-client";
import "../fonts.css";
import "./Menu.css";

const socket = io("http://localhost:4000");

const Menu = () => {
  const [order, setOrder] = useState({
    name: "",
    department: "",
    items: [],
    temperature: {},
    options: {},
    espressoOptions: {},
  });

  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [sugarQuantities, setSugarQuantities] = useState({});
  const menuSectionRef = useRef(null);
  const scrollButtonsRef = useRef(null);
  const CarouselSectionRef = useRef(null);
  const SubmitOrderSectionRef = useRef(null);
  const HeaderSectionRef = useRef(null);
  const departmentSelectRef = useRef(null);
  const [waterValidation, setWaterValidation] = useState(false);
  
  const predefinedItems = [
    "Black Coffee",
    "Espresso",
    "Flat White",
    "Green Tea",
    "Latte",
    "Macchiato",
    "Red Tea",
    "Arabic Coffee",
    "Special Coffee",
    "Ristretto",
    "Cappuccino",
    "Turkish Coffee",
    "Nescafe",
    "Nescafe 3 in 1",
    "Water",
    "Ice Cubes",
  ];

  const itemsWithMilkOption = [
    "Black Coffee",
    "Turkish Coffee",
    "Special Coffee",
    "Ristretto",
    "Nescafe",
    "Nescafe 3 in 1",
    "Green Tea",
    "Red Tea",
  ];

  const allDepartments = [
    "Chairman Office",
    "CEO Office",
    "Digital & IOT Department",
    "Finance Department",
    "Legal Department",
    "Business Development Department",
    "Strategy Management Office",
    "Project Management Office",
    "Compliance and Risk Department",
    "Brand & Communications",
    "Information Technology",
    "Human Resources Department",
    "Human Resources Information Systems Unit",
    "Payroll",
    "Proparty",
    "Talent Acquisition Unit",
    "Shared Services",
    "Organization Development",
    "Total Rewards",
    "Happiness & Engagement Unit",
    "HR Business Partners Unit",
    "Admin and Facility Unit",
    "Companies Affairs",
    "Inovation Lab",
    "Meeting Room -1-",
    "Meeting Room -2-",
    "Meeting Room -3-",
    "Meeting Room -4-",
    "Meeting Room -5-",
    "Meeting Room -6-",
    "Meeting Room -7-",
    "Meeting Room -8-",
    "Meeting Room -9-",
    "Meeting Room -10-",
  ];

  const scrollTobuttonSection = () => {
    SubmitOrderSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCarousel = () => {
    HeaderSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const menuSection = menuSectionRef.current;
      const scrollButtons = scrollButtonsRef.current;
      const scrollPosition = window.scrollY + window.innerHeight;

      if (menuSection && scrollButtons) {
        const menuSectionPosition =
          menuSection.offsetTop + menuSection.offsetHeight;
        if (scrollPosition > 1000) {
          scrollButtons.classList.add("visible");
        } else {
          scrollButtons.classList.remove("visible");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToMenuSection = () => {
    menuSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const departmentOptions = allDepartments.map((department) => ({
    label: department,
    value: department,
  }));

  useEffect(() => {
    socket.on("initialMenuItems", (initialMenuItems) => {
      setMenuItems(initialMenuItems);
      setFilteredMenuItems(initialMenuItems);

      const initialQuantities = {};
      initialMenuItems.forEach((item) => {
        initialQuantities[item.name] = 0;
      });
      setQuantities(initialQuantities);
    });

    socket.on("menuItemAdded", (addedItem) => {
      setMenuItems((prevMenuItems) => [...prevMenuItems, addedItem]);
    });

    socket.on("menuItemDeleted", (deletedItem) => {
      setMenuItems((prevMenuItems) =>
        prevMenuItems.filter((item) => item.name !== deletedItem.name)
      );
    });

    return () => {
      socket.off("initialMenuItems");
      socket.off("menuItemAdded");
      socket.off("menuItemDeleted");
    };
  }, []);

  useEffect(() => {
    setFilteredMenuItems(
      menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [menuItems, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = document.querySelectorAll(".menu-section .cards");
    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, [filteredMenuItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });

    if (name === "name" && value.trim() !== "") {
      const nameInput = document.querySelector(".name2");
      if (nameInput) {
        nameInput.classList.remove("error");
      }
    }

    if (name === "department" && value.trim() !== "") {
      const departmentSelect = document.querySelector(".dep2");
      if (departmentSelect) {
        departmentSelect.classList.remove("error");
      }
    }
  };

  const handleIncrement = (itemName) => {
    setQuantities((prevQuantities) => {
      const newQuantities = {
        ...prevQuantities,
        [itemName]: prevQuantities[itemName] + 1,
      };

      if (itemName === "Water" && !order.temperature[itemName]) {
        setWaterValidation(true);
      }


      if (newQuantities[itemName] > 0) {
        const quantityControl = document.querySelector(
          `.cards[data-item-name="${itemName}"] .quantity-controls`
        );
        if (quantityControl) {
          quantityControl.classList.remove("error-outline");
        }
      }

      return newQuantities;
    });
  };

  const handleDecrement = (itemName) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemName]: Math.max(0, prevQuantities[itemName] - 1),
    }));
  };

  const handleSugarQuantityChange = (itemName, sugarType, quantityChange) => {
    setSugarQuantities((prevSugarQuantities) => {
      const currentSugarQuantities = prevSugarQuantities[itemName] || {
        white: 0,
        brown: 0,
        diet: 0,
      };

      const updatedSugarQuantities = {
        ...prevSugarQuantities,
        [itemName]: {
          ...currentSugarQuantities,
          [sugarType]: Math.max(
            0,
            (currentSugarQuantities[sugarType] || 0) + quantityChange
          ),
        },
      };

      const hasSugarQuantity = Object.values(
        updatedSugarQuantities[itemName]
      ).some((quantity) => quantity > 0);

      if (hasSugarQuantity) {
        const sugarTypeElement = document.querySelector(
          `.cards[data-item-name="${itemName}"] .sugar-types`
        );
        if (sugarTypeElement) {
          sugarTypeElement.classList.remove("error-outline");
        }
      }

      return updatedSugarQuantities;
    });
  };

  const handleCheckboxChange = (e, item) => {
    const { name, checked } = e.target;
    const updatedItems = [...order.items];
    const existingItemIndex = updatedItems.findIndex(
      (orderItem) => orderItem.name === item.name
    );

    const itemOptions = order.options[item.name] || {};

    itemOptions[name] = checked;

    if (existingItemIndex !== -1) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        options: itemOptions,
      };
    } else {
      updatedItems.push({
        ...item,
        options: itemOptions,
        temperature: order.temperature[item.name],
        option: order.espressoOptions[item.name],
      });
    }

    const filteredItems = updatedItems.filter(
      (orderItem) =>
        Object.values(orderItem.options || {}).some((option) => option) ||
        orderItem.name === "Water" ||
        orderItem.name === "Ice Cubes" ||
        orderItem.name === "Espresso"
    );

    setOrder({
      ...order,
      items: filteredItems,
      options: { ...order.options, [item.name]: itemOptions },
    });
  };

  const handleRadioChange = (e, item) => {
    const { value } = e.target;
    const updatedItems = order.items.map((orderItem) =>
        orderItem.name === item.name
            ? {
                  ...orderItem,
                  temperature: value,
                  option: order.espressoOptions[item.name],
              }
            : orderItem
    );

    if (item.name === "Water") {
        setWaterValidation(false);
        
        // Remove red outline when a temperature is selected
        const waterRadioButtons = document.querySelectorAll(
            `input[name="Water-temperature"]`
        );
        waterRadioButtons.forEach((radio) => {
            radio.classList.remove("error");
        });
    }

    const existingItemIndex = updatedItems.findIndex(
        (orderItem) => orderItem.name === item.name
    );

    if (existingItemIndex === -1) {
        updatedItems.push({
            ...item,
            temperature: value,
            options: order.options[item.name] || {},
            option: order.espressoOptions[item.name],
        });
    }

    setOrder({
        ...order,
        items: updatedItems,
        temperature: { ...order.temperature, [item.name]: value },
    });

    if (
        item.name !== "Water" &&
        item.name !== "Ice Cubes" &&
        value.trim() !== ""
    ) {
        const menuItemCard = document.querySelector(
            `.cards[data-item-name="${item.name}"]`
        );
        if (menuItemCard) {
            menuItemCard.classList.remove("error");
        }
    }
};


  const handleEspressoOptionChange = (e, item) => {
    const { value } = e.target;
    const updatedItems = order.items.map((orderItem) =>
      orderItem.name === item.name
        ? {
            ...orderItem,
            option: value,
            temperature: orderItem.temperature,
            options: order.options[item.name] || {},
          }
        : orderItem
    );

    const existingItemIndex = updatedItems.findIndex(
      (orderItem) => orderItem.name === item.name
    );

    if (existingItemIndex === -1) {
      updatedItems.push({
        ...item,
        option: value,
        temperature: order.temperature[item.name],
        options: order.options[item.name] || {},
      });
    }

    setOrder({
      ...order,
      items: updatedItems,
      espressoOptions: { ...order.espressoOptions, [item.name]: value },
    });

    const radioButtons = document.querySelectorAll(
      `input[name="${item.name}-option"]`
    );
    radioButtons.forEach((radio) => radio.classList.remove("error"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const nameInput = document.querySelector(".name2");
    const departmentSelect = document.querySelector(".dep2");

    if (nameInput) nameInput.classList.remove("error");
    if (departmentSelect) departmentSelect.classList.remove("error");

    if (order.name.trim() === "") {
        if (nameInput) {
            nameInput.scrollIntoView({ behavior: "smooth" });
            nameInput.focus();
            nameInput.classList.add("error");
            hasError = true;
        }
    }

    if (order.department.trim() === "") {
        if (departmentSelect) {
            departmentSelect.scrollIntoView({ behavior: "smooth" });
            departmentSelect.focus();
            departmentSelect.classList.add("error");
            hasError = true;
        }
    }

    order.items.forEach((item) => {
        if (item.name !== "Water" && item.name !== "Ice Cubes") {
            const temperatureInput = document.querySelector(
                `input[name="${item.name}-temperature"]:checked`
            );
            if (!temperatureInput) {
                const menuItemCard = document.querySelector(
                    `.cards[data-item-name="${item.name}"]`
                );
                if (menuItemCard) {
                    menuItemCard.scrollIntoView({ behavior: "smooth" });
                    menuItemCard.classList.add("error");
                    hasError = true;
                }
            }
        }

        if (item.name === "Espresso") {
            const espressoOptionInput = document.querySelector(
                `input[name="${item.name}-option"]:checked`
            );
            if (!espressoOptionInput) {
                const radioButtons = document.querySelectorAll(
                    `input[name="${item.name}-option"]`
                );
                radioButtons.forEach((radio) => radio.classList.add("error"));

                const menuItemCard = document.querySelector(
                    `.cards[data-item-name="${item.name}"]`
                );
                if (menuItemCard) {
                    menuItemCard.scrollIntoView({ behavior: "smooth" });
                    hasError = true;
                }
            }
        }

        if (
            order.options[item.name]?.sugar &&
            !Object.values(sugarQuantities[item.name] || {}).some((qty) => qty > 0)
        ) {
            const sugarTypeElement = document.querySelector(
                `.cards[data-item-name="${item.name}"] .sugar-types`
            );
            if (sugarTypeElement) {
                sugarTypeElement.classList.add("error-outline");
                sugarTypeElement.scrollIntoView({ behavior: "smooth" });
                hasError = true;
            }
        }
    });

    const itemsWithZeroQuantity = order.items.filter(
        (item) =>
            quantities[item.name] === 0 &&
            (order.options[item.name] ||
                order.temperature[item.name] ||
                order.espressoOptions[item.name])
    );

    if (itemsWithZeroQuantity.length > 0) {
        itemsWithZeroQuantity.forEach((item) => {
            const quantityControl = document.querySelector(
                `.cards[data-item-name="${item.name}"] .quantity-controls`
            );
            if (quantityControl) {
                quantityControl.classList.add("error-outline");
                quantityControl.scrollIntoView({ behavior: "smooth" });
                hasError = true;
            }
        });
        alert("Please increase the cup quantity for all selected items.");
    }

    // Check for Water temperature validation
    if (quantities["Water"] > 0 && !order.temperature["Water"]) {
        const waterRadioButtons = document.querySelectorAll(
            `input[name="Water-temperature"]`
        );
        waterRadioButtons.forEach((radio) => {
            radio.classList.add("error");
        });

        const waterCard = document.querySelector(`.cards[data-item-name="Water"]`);
        if (waterCard) {
            waterCard.scrollIntoView({ behavior: "smooth" });
            hasError = true;
        }
    } else {
        const waterRadioButtons = document.querySelectorAll(
            `input[name="Water-temperature"]`
        );
        waterRadioButtons.forEach((radio) => {
            radio.classList.remove("error");
        });
    }

    if (order.items.length === 0) {
        setShowValidationMessage(true);
        hasError = true;
    } else {
        setShowValidationMessage(false);
    }

    if (!hasError) {
        const itemsWithQuantities = order.items.map((item) => ({
            ...item,
            quantity: quantities[item.name],
            sugarQuantities: formatSugarQuantities(sugarQuantities[item.name]),
            option: order.espressoOptions[item.name],
        }));
        setOrder({ ...order, items: itemsWithQuantities });
        setShowConfirmation(true);
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
    console.log("departmentSelectRef:", departmentSelectRef.current);
  
    const newOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        temperature: order.temperature[item.name],
        quantity: quantities[item.name],
        options: order.options[item.name] || {},
        sugarQuantities: sugarQuantities[item.name] || {},
        option: order.espressoOptions[item.name] || "",
      })),
    };
  
    socket.emit("newOrder", newOrder);
    setShowConfirmation(false);
  
    setOrder({
      name: "",
      department: "",
      items: [],
      temperature: {},
      options: {},
      espressoOptions: {},
    });
  
    // Reset cup quantities to 0 after submitting the order
    setQuantities(
      menuItems.reduce((acc, item) => ({ ...acc, [item.name]: 0 }), {})
    );
    setSugarQuantities({});
  
    setFilteredMenuItems(menuItems);
  
    document.getElementById("orderForm").reset();
  
    if (departmentSelectRef.current) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        department: "",
      }));
    }
  
    alert("Thanks for ordering! Your coffee will be delivered to you soon.");
  };
  

  const cancelOrder = () => {
    setShowConfirmation(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDepartmentChange = (newValue) => {
    setOrder({ ...order, department: newValue.value });

    if (newValue.value.trim() !== "") {
      const departmentSelect = document.querySelector(".dep2");
      if (departmentSelect) {
        departmentSelect.classList.remove("error");
      }
    }
  };

  const itemImages = {
    "Black Coffee": "/blackcoffee.jpeg",
    Espresso: "/espresso.jpeg",
    "Flat White": "/flat-white.jpeg",
    "Green Tea": "/green-tea.jpeg",
    Latte: "/latte.jpeg",
    Macchiato: "/meccato.jpeg",
    "Red Tea": "/red-tea-.jpeg",
    "Arabic Coffee": "/saudiicoffee.jpeg",
    "Special Coffee": "/blackcoffee.jpeg",
    Ristretto: "/espresso.jpeg",
    Cappuccino: "/Cappuccino.jpeg",
    "Turkish Coffee": "/Turkish-Coffee.jpeg",
    Nescafe: "/Nescafe.jpeg",
    "Nescafe 3 in 1": "/Nescafe.jpeg",
    Water: "/water.jpeg",
    "Ice Cubes": "/ice_cubes.jpeg",
  };

  return (
    <div>
      <header className="header" ref={HeaderSectionRef}>
        <div>
          <h1 className="custom-font header-title">ALJE Digital Café</h1>
        </div>
        <div>
          <img src="/logo3.png" alt="Logo" className="logo-image img-fluid" style={{height:45}} />
        </div>
      </header>

      <div
        id="carouselExampleIndicators"
        className="carousel slide"
        data-bs-ride="carousel"
        ref={CarouselSectionRef}
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <section className="cta">
              <div className=" justify-content-center align-items-center d-flex text-div">
                <div className="cta-text">
                  <h1 className="cta-title">
                    Your <span>Coffee</span> comes to your office
                  </h1>
                </div>

                <div className="cta-image flex-1 flex">
                  <img
                    src="/cofeeesp.png"
                    alt="hero image"
                    className="hero-image w-[200px] sm:w-[200px] sm:scale-110 spin"
                  />
                </div>
              </div>

              <div className="hero-overlay">
                <form className="form-s mt-3">
                  <div className="row mb-3 ">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control custom-font name2"
                        placeholder="Name"
                        name="name"
                        value={order.name}
                        onChange={handleChange}
                        required
                        style={{ color: "gray" }}
                      />
                    </div>
                    <div className="col">
                      <div className="form-control custom-font p-0 dep2">
                        <Select
                          ref={departmentSelectRef}
                          classNamePrefix="dep2"
                          name="department"
                          options={departmentOptions}
                          menuPlacement="top"
                          value={departmentOptions.find(
                            (option) => option.value === order.department
                          )}
                          onChange={handleDepartmentChange}
                          placeholder="Department"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </form>

                <button
                  className="order-now-button custom-font"
                  onClick={scrollToMenuSection}
                >
                  Order Now <i className="bi bi-arrow-down"></i>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="menu-section" ref={menuSectionRef}>
        <div className="container">
          <h1 className="sections-title mb-5">Menu</h1>

          <div className="search-field mb-4 custom-font">
            <div className="input-group">
              <input
                type="text"
                className="form-control custom-font"
                placeholder="Search for your favorite coffee..."
                value={searchQuery}
                onChange={handleSearch}
                aria-describedby="search-icon"
              />
              <span className="input-group-text custom-font" id="search-icon">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>

          <div className="forms-section" ref={menuSectionRef}>
            {filteredMenuItems.map((item) => (
              <div
                key={item.name}
                className="cards mx-3 mb-3 custom-font"
                data-item-name={item.name}
              >
                <div className="cards-body">
                  <div className="card-body">
                    <h5 className="cards-title">{item.name}</h5>
                    {item.name === "Ice Cubes" && (
                      <div key="ice-cubes" className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`${item.name}-cup`}
                          name="cup of ice cubes"
                          onChange={(e) => handleCheckboxChange(e, item)}
                          checked={
                            order.options[item.name]?.["cup of ice cubes"] ||
                            false
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`${item.name}-cup`}
                        >
                          Cup of Ice Cubes
                        </label>
                      </div>
                    )}

                    {item.name === "Water" && (
                      <>
                        <div className="form-check">
                          <input
                            className="form-check-input "
                            type="radio"
                            id={`${item.name}-Cold`}
                            name={`${item.name}-temperature`}
                            value="Cold"
                            checked={order.temperature[item.name] === "Cold"}
                            onChange={(e) => handleRadioChange(e, item)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`${item.name}-Cold`}
                          >
                            Cold
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            id={`${item.name}-Warm`}
                            name={`${item.name}-temperature`}
                            value="Warm"
                            checked={order.temperature[item.name] === "Warm"}
                            onChange={(e) => handleRadioChange(e, item)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`${item.name}-Warm`}
                          >
                            Warm
                          </label>
                        </div>
                      </>
                    )}

                    {item.name !== "Ice Cubes" && item.name !== "Water" && (
                      <>
                        {item.options?.map((option, idx) => (
                          <div key={idx} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`${item.name}-${option}`}
                              name={option}
                              onChange={(e) => handleCheckboxChange(e, item)}
                              checked={
                                order.options[item.name]?.[option] || false
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`${item.name}-${option}`}
                            >
                              {option}
                            </label>
                          </div>
                        ))}
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
                      </>
                    )}

{predefinedItems.includes(item.name) &&
item.name !== "Espresso" && item.name !== "Ice Cubes" && item.name !== "Water" && (
  <div key="sugar-container" className="mb-3">
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        id={`${item.name}-sugar`}
        name="sugar"
        onChange={(e) => handleCheckboxChange(e, item)}
        checked={order.options[item.name]?.sugar || false}
      />
      <label className="form-check-label" htmlFor={`${item.name}-sugar`}>
        Sugar
      </label>
      {sugarQuantities[item.name] &&
        (sugarQuantities[item.name].white > 0 ||
          sugarQuantities[item.name].brown > 0 ||
          sugarQuantities[item.name].diet > 0) && (
          <i className="bi bi-check-circle-fill text-success ms-2"></i>
        )}
    </div>
 
    {order.options[item.name]?.sugar && (
      <div className="mt-2">
        <div className="d-flex flex-column">
          {["white", "brown", "diet"].map((sugarType) => (
            <div key={sugarType} className="form-check d-flex align-items-center mb-2">
              <label
                className="form-check-label"
                htmlFor={`${item.name}-${sugarType}-sugar`}
                style={{ marginRight: "8px" }}
              >
                {sugarType.charAt(0).toUpperCase() + sugarType.slice(1)}
              </label>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleSugarQuantityChange(item.name, sugarType, -1)}
                  style={{ marginRight: "4px" }}
                >
                  -
                </button>
                <span className="mx-1">
                  {sugarQuantities[item.name]?.[sugarType] || 0}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleSugarQuantityChange(item.name, sugarType, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
                    {itemsWithMilkOption.includes(item.name) && (
                      <div key="milk" className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`${item.name}-milk`}
                          name="Milk"
                          onChange={(e) => handleCheckboxChange(e, item)}
                          checked={order.options[item.name]?.Milk || false}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`${item.name}-milk`}
                        >
                          Milk
                        </label>
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
                              checked={
                                order.espressoOptions[item.name] === option
                              }
                              onChange={(e) =>
                                handleEspressoOptionChange(e, item)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`${item.name}-${option}`}
                            >
                              {option}
                            </label>
                          </div>
                        ))
                      : null}

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
                    className="menu-item-image"
                  />
                </div>
              </div>
            ))}
          </div>

          <form id="orderForm" onSubmit={handleSubmit} className="container custom-font">
  <div className="row justify-content-center">
    <div className="col-12 col-md-6 col-lg-4">
      <button
        type="submit"
        className="btn btn-primary btn-block mt-4 order-now-button"
        ref={SubmitOrderSectionRef}
        style={{
          backgroundColor: "rgba(82, 133, 154)",
          color: "white",
          border: "none",
          width: "100%",
          marginBottom: "0",
        }}
      >
        Submit Order
      </button>
    </div>
  </div>
</form>

          {showValidationMessage && (
            <div className="alert alert-danger mt-4 text-center">
              Please place an order.
            </div>
          )}

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
            <div
              className="modal fade show custom-modal"
              id="confirmationModal"
              tabIndex="-1"
              aria-labelledby="confirmationModalLabel"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="confirmationModalLabel">
                      Confirm Order
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={cancelOrder}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Name:</strong> {order.name}
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Department:</strong>{" "}
                        {order.department}
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Items:</strong>{" "}
                        {order.items
                          .map((item) => {
                            const options = Object.keys(item.options || {})
                              .filter((option) => item.options[option])
                              .join(", ");
                            const espressoOption = item.option
                              ? ` (${item.option})`
                              : "";
                            return `${
                              item.name
                            } (${options}${espressoOption}) x ${
                              quantities[item.name]
                            }`;
                          })
                          .join(", ")}
                      </div>
                      {order.items.some(
                        (item) =>
                          item.sugarQuantities &&
                          Object.values(item.sugarQuantities).some(
                            (quantity) => quantity > 0
                          )
                      ) && (
                        <div className="d-flex align-items-center mb-2">
                          <strong className="me-2">Sugar Quantities:</strong>{" "}
                          {order.items
                            .map((item) =>
                              item.sugarQuantities &&
                              Object.values(item.sugarQuantities).some(
                                (quantity) => quantity > 0
                              )
                                ? `${item.name} (${Object.entries(
                                    item.sugarQuantities
                                  )
                                    .map(
                                      ([type, quantity]) =>
                                        `${type}: ${quantity}`
                                    )
                                    .join(", ")})`
                                : ""
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Temperature:</strong>{" "}
                        {Object.keys(order.temperature)
                          .map(
                            (item) =>
                              `${item}: ${order.temperature[item]}`
                          )
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-no btn-secondary"
                      onClick={cancelOrder}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="btn-yes btn-primary"
                      onClick={confirmOrder}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="footer opacity-55 custom-font">
        <div className="footer-container">
          <p className="footer-text">
            ©️ 2024 Abdul Latif Jameel Enterprises. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
