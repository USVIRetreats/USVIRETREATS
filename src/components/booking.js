export const initializeBooking = () => {
    // Modal and general UI elements
    const calendarModal = document.getElementById('calendarModal');
    const inquiryModal = document.getElementById('bookingInquiryModal');
    const checkAvailabilityButtons = document.querySelectorAll('.booking-btn');
    const closeBtn = document.querySelector('.close-calendar');
    const closeInquiryBtn = document.querySelector('.close-inquiry');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const monthDisplay = document.getElementById('currentMonth');
    const calendarGrid = document.getElementById('calendarGrid');
    const checkInDisplay = document.getElementById('checkInDisplay');
    const checkOutDisplay = document.getElementById('checkOutDisplay');
    const confirmButton = document.getElementById('confirmDates');
    const inquiryForm = document.getElementById('inquiryForm');
    const calendarTitle = calendarModal ? calendarModal.querySelector('.calendar-title') : null;

    // Modal dynamic sections
    const modalGuestRoomSection = calendarModal ? calendarModal.querySelector('.guests-rooms-section') : null;
    const modalServicesSection = calendarModal ? calendarModal.querySelector('.services-section') : null;
    const guestCountInput = document.getElementById('guestCount');
    const modalGuestContainer = document.getElementById('modalGuestContainer');
    const modalGuestLabel = document.getElementById('modalGuestLabel');
    const roomCountInput = document.getElementById('roomCount'); // Assuming this and modalRoomContainer might also be modal-specific
    const modalRoomContainer = document.getElementById('modalRoomContainer'); // Same assumption
    const numberInputControls = calendarModal ? calendarModal.querySelectorAll('.number-input button') : null;
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let checkInDate = null;
    let checkOutDate = null;
    let currentPackage = null;
    let currentPackageDetails = null; // Will hold details for the currently selected package

    const cateringServiceCheckbox = document.getElementById('cateringService');
    const transportServiceCheckbox = document.getElementById('transportService');

    const bookedDates = {
        'estate-st-peter': [ // All retreats/estate bookings will use this key
            { start: new Date(2024, 6, 10), end: new Date(2024, 6, 13) }, // Example: July 10-13, 2024
            { start: new Date(2024, 7, 5), end: new Date(2024, 7, 10) }   // Example: August 5-10, 2024
        ],
    };

    // Centralized package details
    const packageDetailsStore = {
        // Retreat Packages
        'artist-retreat': {
            type: 'retreat',
            name: 'Artist Retreat',
            basePrice: 4500, // Price per person
            perNight: false, // Package price
            maxGuests: 6,
            fixedDurationNights: 3, // 4 Days, 3 Nights_
            imageName: 'Villa Alhambra.webp',
            description: "St Thomas Villa (4 Day, 3 Nights). Price $4,444/person for 6 guests. Includes Yacht, Catering, Airport Transport/Insurance.",
            uiSections: {
                guestCount: true,
                roomCount: false, 
                services: true, // To show "included services" message
            }
        },
        'external-host-retreat': {
            type: 'retreat',
            name: 'External Host Retreat',
            basePrice: 30000,
            perNight: false, // Package price
            maxGuests: 20, // Max capacity of Estate St. Peter
            imageName: 'Tower Villa.webp',
            description: "Base Package for External Hosts. Includes St. Thomas Villa, Catering (1x Meal/Day).",
            upgrades: [
                { id: 'transportPackage', name: 'Transport Package (Car/Host Accommodations)', price: 3500, checked: false },
                { id: 'conciergeLiaison', name: '1x Concierge, 1x Liaison', price: 5000, checked: false },
                { id: 'additionalMeal', name: '1x Additional Meal/day', price: 3000, checked: false }
            ],
            uiSections: {
                guestCount: true,
                roomCount: false, 
                services: true // To show upgrades
            }
        },
        // Example Villa (if any were to remain or be re-added, ensure unique keys)
        // 'estate-st-peter-booking': { // Represents booking the entire estate as a "villa"
        //     type: 'villa',
        //     name: 'Estate St. Peter (Full Property)',
        //     basePrice: 7000, // Example daily rate for whole estate
        //     perNight: true,
        //     services: { catering: 750, transport: 550, both: 1300 },
        //     maxGuests: 20,
        //     imageName: 'Estate St Peter.webp', // General estate image
        //     description: "Book the entire five-villa estate for an exclusive experience."
        // },
        // Yachts
        'luxury-yacht': {
            type: 'yacht',
            name: 'Luxury Yacht',
            basePrice: 2500,
            perNight: true, // true means per day for yachts/services
            maxGuests: 8, // Represents passengers
            imageName: 'yacht1.webp', // Filename with extension
            description: "Ultimate luxury sailing experience"
        },
        'catamaran': {
            type: 'yacht',
            name: 'Catamaran',
            basePrice: 1800,
            perNight: true,
            maxGuests: 10,
            imageName: 'yacht2.webp',
            description: "Stable and spacious sailing"
        },
        'speedboat': {
            type: 'yacht',
            name: 'Speedboat',
            basePrice: 1200,
            perNight: true,
            maxGuests: 6,
            imageName: 'yacht3.webp',
            description: "Fast and thrilling experience"
        },
        // Services
        'catering-service': {
            type: 'service',
            name: 'Private Chef & Catering',
            basePrice: 750, // Daily rate
            perNight: true, // Per day
            imageName: 'catering.webp', // Filename with extension
            description: "Personalized dining experience in your villa"
        },
        'transport-insurance': {
            type: 'service',
            name: 'Airport Transfer & Insurance',
            basePrice: 550, // Flat rate
            perNight: false,
            imageName: 'transport.webp',
            description: "Seamless travel experience with complete coverage"
        },
        'concierge-service': { // Added based on accommodations.html
            type: 'service',
            name: 'Premium Concierge Service',
            basePrice: 200, // Daily rate
            perNight: true,
            imageName: 'concierge.webp',
            description: "Your personal assistant in paradise"
        },
        'complete-package': { // Added based on accommodations.html
            type: 'service',
            name: 'Complete Service Package',
            basePrice: 1000, // Assuming flat rate, adjust if per day
            perNight: false,
            imageName: 'premium.webp',
            description: "All-inclusive luxury experience"
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formatDate = (date) => {
        if (!date) return 'Not selected';
        // Ensure date is a Date object
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return 'Invalid date';

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    };

    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((checkOut - checkIn) / oneDay));
    };

    const isDateBooked = (date) => {
        // Retreats book the 'estate-st-peter'. Other types use their own package key.
        const bookingKey = (currentPackageDetails && currentPackageDetails.type === 'retreat') ? 'estate-st-peter' : currentPackage;

        if (!bookingKey || !bookedDates[bookingKey]) return false;

        return bookedDates[bookingKey].some(booking => {
            const bookingStart = new Date(booking.start);
            bookingStart.setHours(0,0,0,0);
            const bookingEnd = new Date(booking.end);
            bookingEnd.setHours(0,0,0,0);
            const checkDate = new Date(date);
            checkDate.setHours(0,0,0,0);
            return checkDate >= bookingStart && checkDate <= bookingEnd;
        });
    };

    const getImagePath = (pkgId) => {
        const details = packageDetailsStore[pkgId];
        if (!details || !details.imageName) return './public/Pictures/default.webp'; // Fallback

        switch (details.type) {
            case 'villa':
                return `./public/Pictures/villas/${details.imageName}`; // Assumes villas have .webp implicitly
            case 'retreat':
                return `./public/Pictures/villas/${details.imageName}`;
            case 'yacht':
                return `./public/Pictures/yachts/${details.imageName}`;
            case 'service':
                return `./public/Pictures/accommodations/${details.imageName}`;
            default:
                return './public/Pictures/default.webp';
        }
    };

    const updateTotal = () => {
        if (!currentPackageDetails || !checkInDate) { // Only checkInDate needed for flat rates
            if (document.getElementById('totalAmount')) document.getElementById('totalAmount').textContent = 'Quote on Request';
            return 0;
        }

        let total = 0;
        const nights = (currentPackageDetails.fixedDurationNights)
            ? currentPackageDetails.fixedDurationNights
            : (checkOutDate && checkInDate) ? calculateNights(checkInDate, checkOutDate) : 1;

        if (currentPackageDetails.type === 'retreat') {
            if (currentPackageDetails.name === 'Artist Retreat') {
                // Artist Retreat: basePrice is per person.
                // Price scales with the number of guests selected in the modal via guestCountInput.
                // Fallback to maxGuests if guestCountInput is not available or its value is not parsable, though this should be rare.
                const guests = guestCountInput && guestCountInput.value ? parseInt(guestCountInput.value) : (currentPackageDetails.maxGuests || 1);
                total = currentPackageDetails.basePrice * guests;
            } else {
                // Other retreats (e.g., External Host): basePrice is a flat package price
                total = currentPackageDetails.basePrice;
            }

            if (currentPackageDetails.upgrades) {
                currentPackageDetails.upgrades.forEach(upgrade => {
                    if (upgrade.checked) {
                        total += upgrade.price;
                    }
                });
            }
        } else if (currentPackageDetails.perNight) {
            total = currentPackageDetails.basePrice * (nights > 0 ? nights : 1); // Villas, Yachts, per-day services
        } else {
            total = currentPackageDetails.basePrice; // Flat rate
        }

        // Add costs for modal-selected services (only for villas)
        let serviceCost = 0;
        if (currentPackageDetails.type === 'villa' && currentPackageDetails.services) { // Original villa services
            if (cateringServiceCheckbox && transportServiceCheckbox) { // Ensure they exist
                const hasCatering = cateringServiceCheckbox.checked;
                const hasTransport = transportServiceCheckbox.checked;

                if (hasCatering) {
                    serviceCost += currentPackageDetails.services.catering * (nights > 0 ? nights : 1);
                }
                if (hasTransport) { // Assuming transport is flat rate addon for villas here
                    serviceCost += currentPackageDetails.services.transport;
                }
            }
        }
        total += serviceCost;

        // Update the displayed total
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = `Quote on Request`;
        }
        return total;
    };

    const updateDateDisplay = () => {
        if (checkInDisplay && checkOutDisplay) {
            if (currentPackageDetails && currentPackageDetails.type === 'retreat' && currentPackageDetails.fixedDurationNights && checkInDate) {
                const durationMillis = currentPackageDetails.fixedDurationNights * 24 * 60 * 60 * 1000;
                const autoCheckoutDate = new Date(checkInDate.getTime() + durationMillis);
                checkInDisplay.textContent = `Retreat Start: ${formatDate(checkInDate)}`;
                checkOutDisplay.textContent = `Retreat End: ${formatDate(autoCheckoutDate)}`;
            } else if (currentPackageDetails && (currentPackageDetails.type === 'service' && !currentPackageDetails.perNight)) {
                checkInDisplay.textContent = `Service Date: ${formatDate(checkInDate)}`;
                checkOutDisplay.textContent = `Ends: ${formatDate(checkInDate)}`; 
            } else if (currentPackageDetails && (currentPackageDetails.type === 'yacht' || currentPackageDetails.type === 'service')) {
                checkInDisplay.textContent = `Start Date: ${formatDate(checkInDate)}`;
                checkOutDisplay.textContent = `End Date: ${formatDate(checkOutDate)}`;
            } else { // Default for villas or other flexible date items
                checkInDisplay.textContent = `Check-in: ${formatDate(checkInDate)}`;
                checkOutDisplay.textContent = `Check-out: ${formatDate(checkOutDate)}`;
            }
        }
        
        if (confirmButton) {
            let canConfirm = false;
            if (currentPackageDetails && (currentPackageDetails.type === 'retreat' && currentPackageDetails.fixedDurationNights) || (currentPackageDetails.type === 'service' && !currentPackageDetails.perNight)) {
                canConfirm = !!checkInDate;
            } else {
                canConfirm = !!(checkInDate && checkOutDate);
            }
            confirmButton.disabled = !canConfirm;
        }
        updateTotal();
    };

    const handleDateClick = (date) => {
        const clickedDate = new Date(currentYear, currentMonth, date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (clickedDate < today || isDateBooked(clickedDate)) return;

        if (currentPackageDetails && currentPackageDetails.type === 'retreat' && currentPackageDetails.fixedDurationNights) {
            // For fixed duration retreats, selecting a start date determines the end date.
            checkInDate = clickedDate;
            const durationMillis = currentPackageDetails.fixedDurationNights * 24 * 60 * 60 * 1000;
            checkOutDate = new Date(checkInDate.getTime() + durationMillis);

            // Validate the entire range for fixed duration retreats
            let tempDate = new Date(checkInDate);
            let rangeIsClear = true;
            // Check from checkInDate up to the day before checkOutDate
            while (tempDate < checkOutDate) {
                if (isDateBooked(tempDate)) {
                    rangeIsClear = false;
                    break;
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }
            // Also check the calculated checkOutDate itself if it's part of the booked period (inclusive end)
            // The isDateBooked logic should handle if booking.end is inclusive.
            // For fixed duration, the checkout day itself should also be clear.

            if (!rangeIsClear) {
                alert(`The ${currentPackageDetails.fixedDurationNights}-night duration for this retreat is unavailable starting ${formatDate(clickedDate)} due to existing bookings in the range.`);
                checkInDate = null;
                checkOutDate = null;
            } else {
                console.log(`${currentPackageDetails.name} selected: ${formatDate(checkInDate)} to ${formatDate(checkOutDate)}`);
            }
        } else if (currentPackageDetails && currentPackageDetails.type === 'service' && !currentPackageDetails.perNight) {
            checkInDate = clickedDate;
            checkOutDate = clickedDate; // Set checkout same as checkin for single day/flat rate
            console.log('Service date selected:', formatDate(checkInDate));
        } else if (!checkInDate || (checkInDate && checkOutDate)) {
            // First click (select check-in) or restarting selection for variable duration items
            checkInDate = clickedDate;
            checkOutDate = null;
            console.log('Check-in selected:', formatDate(checkInDate));
        } else if (checkInDate && !checkOutDate) {
            // Second click (select check-out) for variable duration items
            if (clickedDate > checkInDate) {

                // Check for booked dates within the selected range
                let tempDate = new Date(checkInDate);
                tempDate.setDate(tempDate.getDate() + 1); // Start checking from day after check-in
                let rangeIsClear = true;
                while (tempDate < clickedDate) {
                    if (isDateBooked(tempDate)) {
                        rangeIsClear = false;
                        break;
                    }
                    tempDate.setDate(tempDate.getDate() + 1);
                }

                if (rangeIsClear) {
                    checkOutDate = clickedDate;
                    console.log('Check-out selected:', formatDate(checkOutDate));
                } else {
                    alert('The selected date range includes booked dates. Please choose a different check-out date.');
                }
            } else {
                // Clicked date is before or same as current check-in, so treat as new check-in
                checkInDate = clickedDate;
                checkOutDate = null;
            }
        }

        updateDateDisplay();
        createCalendar(); // Refresh the calendar to show the selection
    };

    const createCalendar = () => {
        if (!monthDisplay || !calendarGrid) return;
        
        monthDisplay.textContent = `${months[currentMonth]} ${currentYear}`;
        calendarGrid.innerHTML = '';

        // Add weekday headers
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day header';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Add empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Create calendar days
        for (let day = 1; day <= lastDate; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';

            const date = new Date(currentYear, currentMonth, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;

            // Apply appropriate classes based on date status
            if (date < today) {
                dayElement.classList.add('past');
            } else if (isDateBooked(date)) {
                dayElement.classList.add('booked');
            } else {
                dayElement.onclick = () => handleDateClick(day);

                // Add hover effects for available dates
                dayElement.addEventListener('mouseenter', () => {
                    if (!dayElement.classList.contains('past') && !dayElement.classList.contains('booked')) {
                        dayNumber.classList.add('hover');
                    }
                });

                dayElement.addEventListener('mouseleave', () => {
                    // No need to check checkInDate, just remove hover if it was added
                    dayNumber.classList.remove('hover');
                });
            }

            // Check if this date is the check-in date
            if (checkInDate && date.getTime() === checkInDate.getTime()) {
                dayNumber.classList.add('selected-checkin');
            } 
            // Check if this date is the check-out date
            else if (checkOutDate && date.getTime() === checkOutDate.getTime()) {
                dayNumber.classList.add('selected-checkout');
            } 
            // Check if this date is in the range between check-in and check-out
            else if (checkInDate && checkOutDate && 
                     date > checkInDate && date < checkOutDate) {
                dayNumber.classList.add('in-range');
            }

            dayElement.appendChild(dayNumber);
            calendarGrid.appendChild(dayElement);
        }
    };

    // Event Listeners
    if (checkAvailabilityButtons) {
        checkAvailabilityButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentPackage = button.dataset.package;
                currentPackageDetails = packageDetailsStore[currentPackage];

                if (!currentPackageDetails) {
                    console.error("Package details not found for:", currentPackage);
                    return;
                }

                checkInDate = null;
                checkOutDate = null;

                // Update modal title
                 if (calendarTitle) {
                    if (currentPackageDetails.type === 'retreat') {
                        calendarTitle.textContent = `Book ${currentPackageDetails.name}`;
                    } else {
                        calendarTitle.textContent = `Book Your ${currentPackageDetails.type === 'villa' ? 'Stay' : currentPackageDetails.name}`;
                    }
                }

                // Reset and configure modal sections
                if (modalGuestRoomSection) modalGuestRoomSection.style.display = 'none';
                if (modalServicesSection) modalServicesSection.style.display = 'none';
                if (modalGuestContainer) modalGuestContainer.style.display = 'none';
                if (modalRoomContainer) modalRoomContainer.style.display = 'none';

                const modalServicesOptionsContainer = document.getElementById('modalServicesOptions');
                if (modalServicesOptionsContainer) modalServicesOptionsContainer.innerHTML = ''; // Clear previous dynamic options
                const servicesSectionTitle = calendarModal ? calendarModal.querySelector('.services-section h4') : null;
                const originalVillaServiceElements = calendarModal ? calendarModal.querySelectorAll('.original-villa-service') : [];
                originalVillaServiceElements.forEach(el => el.style.display = 'none');


                if (currentPackageDetails.type === 'villa') {
                    if (modalGuestRoomSection) modalGuestRoomSection.style.display = 'flex'; // Or 'block'
                    if (modalServicesSection) modalServicesSection.style.display = 'block';
                    if (servicesSectionTitle) servicesSectionTitle.textContent = 'Additional Services';
                    originalVillaServiceElements.forEach(el => el.style.display = 'block');
                    if (modalGuestContainer && modalGuestLabel) {
                        modalGuestContainer.style.display = 'block';
                        modalGuestLabel.textContent = 'Guests';
                    }
                    if (modalRoomContainer) modalRoomContainer.style.display = 'block';
                    if (guestCountInput) {
                        guestCountInput.max = currentPackageDetails.maxGuests || 6;
                        guestCountInput.value = 1;
                    }
                    if (roomCountInput) roomCountInput.value = 1; // Default for villas
                    if (cateringServiceCheckbox) cateringServiceCheckbox.checked = false;
                    if (transportServiceCheckbox) transportServiceCheckbox.checked = false;
                } else if (currentPackageDetails.type === 'retreat') {
                    if (modalGuestRoomSection && currentPackageDetails.uiSections?.guestCount) modalGuestRoomSection.style.display = 'flex';
                    if (modalGuestContainer && modalGuestLabel && currentPackageDetails.uiSections?.guestCount) {
                        modalGuestContainer.style.display = 'block';
                        modalGuestLabel.textContent = 'Guests';
                    }
                    if (guestCountInput) {
                        guestCountInput.value = (currentPackageDetails.name === 'Artist Retreat' && currentPackageDetails.maxGuests) ? currentPackageDetails.maxGuests : 1;
                        guestCountInput.max = currentPackageDetails.maxGuests || 20;
                        // guestCountInput.disabled = currentPackageDetails.name === 'Artist Retreat'; // Optionally disable for fixed guest count
                    }

                    if (currentPackageDetails.uiSections?.services) {
                        if (modalServicesSection) modalServicesSection.style.display = 'block';
                        if (currentPackageDetails.upgrades) { // External Host Retreat
                            if (servicesSectionTitle) servicesSectionTitle.textContent = 'Available Upgrades';
                            currentPackageDetails.upgrades.forEach(upgrade => {
                                upgrade.checked = false; // Reset on modal open
                                const upgradeDiv = document.createElement('div');
                                upgradeDiv.className = 'service-option';
                                const checkbox = document.createElement('input');
                                checkbox.type = 'checkbox';
                                checkbox.id = `upgrade-${upgrade.id}`;
                                checkbox.dataset.upgradeId = upgrade.id;
                                checkbox.addEventListener('change', (e) => {
                                    const uId = e.target.dataset.upgradeId;
                                    const selectedUpgrade = currentPackageDetails.upgrades.find(up => up.id === uId);
                                    if (selectedUpgrade) selectedUpgrade.checked = e.target.checked;
                                    updateTotal();
                                });
                                const label = document.createElement('label');
                                label.htmlFor = `upgrade-${upgrade.id}`;
                                label.textContent = `${upgrade.name}`;
                                upgradeDiv.appendChild(checkbox);
                                upgradeDiv.appendChild(label);
                                if (modalServicesOptionsContainer) modalServicesOptionsContainer.appendChild(upgradeDiv);
                            });
                        } else if (currentPackageDetails.name === 'Artist Retreat') { // Artist Retreat included services
                            if (servicesSectionTitle) servicesSectionTitle.textContent = 'Included Services';
                            if (modalServicesOptionsContainer) modalServicesOptionsContainer.innerHTML = `<p style="padding: 10px 0;">Yacht, Catering, Airport Transport/Insurance are included.</p>`;
                        }
                    }
                } else if (currentPackageDetails.type === 'yacht') {
                    if (modalGuestRoomSection) modalGuestRoomSection.style.display = 'flex';
                    if (modalGuestContainer && modalGuestLabel) {
                        modalGuestContainer.style.display = 'block';
                        modalGuestLabel.textContent = 'Passengers';
                    }
                    if (guestCountInput) {
                        guestCountInput.max = currentPackageDetails.maxGuests || 8;
                        guestCountInput.value = 1;
                    }
                } else if (currentPackageDetails.type === 'service') {
                    // Basic services, guest/room/additional sections usually hidden unless specified by package
                }

                updateDateDisplay();
                
                if (calendarModal) {
                    calendarModal.classList.add('active');
                    calendarModal.setAttribute('data-current-package-type', currentPackageDetails.type);
                }
                
                createCalendar();
            });
        });
    }

    // Guest and Room Counters
    if (numberInputControls) {
        numberInputControls.forEach(button => {
            button.addEventListener('click', () => {
                const inputField = button.parentElement.querySelector('input');
                if (!inputField) return;

                let currentValue = parseInt(inputField.value);
                const min = parseInt(inputField.min);
                const max = parseInt(inputField.max);

                if (button.classList.contains('increase')) {
                    if (currentValue < max) currentValue++;
                } else if (button.classList.contains('decrease')) {
                    if (currentValue > min) currentValue--;
                }
                inputField.value = currentValue;
                updateTotal(); // Recalculate total if guest/room count affects price (or for future-proofing)
            });
        });
    }
    // Modal controls
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (calendarModal) {
                calendarModal.classList.remove('active');
            }
        });
    }
    
    if (closeInquiryBtn) {
        closeInquiryBtn.addEventListener('click', () => {
            if (inquiryModal) {
                inquiryModal.classList.remove('active');
            }
        });
    }

    // Calendar navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;
            createCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;
            createCalendar();
        });
    }

    // Service toggles
    if (cateringServiceCheckbox) {
        cateringServiceCheckbox.addEventListener('change', updateTotal);
    }
    
    if (transportServiceCheckbox) {
        transportServiceCheckbox.addEventListener('change', updateTotal);
    }

    // Confirm booking
    if (confirmButton) {
        confirmButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!currentPackageDetails || !checkInDate) return;
            // For items that require a date range, checkOutDate is also needed
            // For fixed duration retreats, checkOutDate is derived, so only checkInDate is essential.
            if (currentPackageDetails.perNight && !currentPackageDetails.fixedDurationNights && !checkOutDate) return;

            // Calculate booking total
            const totalPrice = updateTotal();
            const nights = (currentPackageDetails && currentPackageDetails.fixedDurationNights)
                ? currentPackageDetails.fixedDurationNights
                : (checkInDate && checkOutDate) ? calculateNights(checkInDate, checkOutDate) : 1;

            // Get services
            let itemName = currentPackageDetails.name;
            if (currentPackageDetails.type === 'retreat') {
                if (currentPackageDetails.fixedDurationNights) {
                    const days = currentPackageDetails.fixedDurationNights + 1;
                    itemName += ` (${days} Days / ${nights} Nights)`;
                }
                if (currentPackageDetails.upgrades) {
                    const selectedUpgrades = currentPackageDetails.upgrades
                        .filter(up => up.checked)
                        .map(up => up.name.split('(')[0].trim()); // Get cleaner name
                    if (selectedUpgrades.length > 0) {
                        itemName += ` with ${selectedUpgrades.join(', ')}`;
                    }
                }
            } else if (currentPackageDetails.type === 'villa') {
                const selectedServices = [];
                if (cateringServiceCheckbox?.checked) selectedServices.push('Catering');
                if (transportServiceCheckbox?.checked) selectedServices.push('Transport');
                if (selectedServices.length > 0) {
                    itemName += ` (${nights} night${nights > 1 ? 's' : ''}, with ${selectedServices.join(' & ')})`;
                } else {
                    itemName += ` (${nights} night${nights > 1 ? 's' : ''})`;
                }
            } else if (currentPackageDetails.perNight) { // Yachts or per-day services
                itemName += ` (${nights} day${nights > 1 ? 's' : ''})`;
            }
            // For flat rate services, itemName is just currentPackageDetails.name

            if (calendarModal) {
                calendarModal.classList.remove('active');
            }

            if (window.shoppingCart) {
                const imagePath = getImagePath(currentPackage);
                const itemDescription = currentPackageDetails.description || itemName;

                // Create a unique ID for the booking item, incorporating dates to allow re-booking same package for different dates
                let itemIdSuffix = checkInDate.toISOString().split('T')[0];
                // For fixed duration retreats, checkOutDate is derived.
                const effectiveCheckoutDate = (currentPackageDetails.type === 'retreat' && currentPackageDetails.fixedDurationNights && checkInDate)
                    ? new Date(checkInDate.getTime() + currentPackageDetails.fixedDurationNights * 24 * 60 * 60 * 1000)
                    : checkOutDate;
                if (effectiveCheckoutDate && checkInDate.toISOString().split('T')[0] !== effectiveCheckoutDate.toISOString().split('T')[0]) {
                    itemIdSuffix += '_' + checkOutDate.toISOString().split('T')[0];
                }
                const itemId = `${currentPackage}-${itemIdSuffix}`;

                window.shoppingCart.addToCart(itemName, totalPrice, imagePath, itemId, itemDescription);
                
            } else {
                alert("Cart system not initialized. Please refresh the page and try again.");
            }
        });
    }

    // Initialize the calendar if it exists
    if (calendarGrid) {
        createCalendar();
    }
};